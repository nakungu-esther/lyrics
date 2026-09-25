import express, { Router } from "express";
import { createReadStream } from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { absolutePath } from "../lib/storage.js";
import { env } from "../config/env.js";
import {
  UploadServiceError,
  completeUpload,
  presignUpload,
} from "../services/uploadService.js";
import { SongServiceError } from "../services/songService.js";
import { verifyUploadToken } from "../storage/uploadToken.js";
import type { UploadResourceType } from "../storage/mediaPolicy.js";

const resourceTypeSchema = z.enum([
  "SONG_AUDIO",
  "SONG_COVER",
  "MUSIC_VIDEO",
  "ARTIST_PROFILE",
  "ARTIST_COVER",
]);

const presignSchema = z.object({
  resourceType: resourceTypeSchema,
  songId: z.string().uuid().optional(),
  artistId: z.string().uuid().optional(),
  filename: z.string().max(255).optional(),
  contentType: z.string().min(3).max(128),
  size: z.number().int().positive(),
});

const completeSchema = presignSchema.extend({
  objectKey: z.string().min(3).max(512),
});

export const uploadsRouter = Router();

function mapUploadError(err: unknown, res: import("express").Response): boolean {
  if (err instanceof SongServiceError) {
    const status = err.code === "NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : 400;
    res.status(status).json({ success: false, message: err.message });
    return true;
  }
  if (err instanceof UploadServiceError) {
    const status =
      err.code === "FILE_TOO_LARGE"
        ? 413
        : err.code === "NOT_FOUND"
          ? 404
          : err.code === "FORBIDDEN"
            ? 403
            : err.code === "CONFLICT"
              ? 409
              : err.code === "STORAGE"
                ? 500
                : 400;
    res.status(status).json({ success: false, message: err.message });
    return true;
  }
  if (err instanceof Error && err.message.includes("Artist profile")) {
    res.status(403).json({ success: false, message: err.message });
    return true;
  }
  return false;
}

/** Local dev: direct PUT upload using signed token (same flow as S3 presigned PUT). */
uploadsRouter.put("/put", async (req, res) => {
  const token = String(req.query.token ?? "");
  const payload = verifyUploadToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: "Invalid or expired upload token" });
    return;
  }

  const contentLength = Number(req.headers["content-length"] ?? 0);
  if (payload.maxSize > 0 && contentLength > payload.maxSize) {
    res.status(413).json({ success: false, message: "File too large" });
    return;
  }

  const dest = absolutePath(payload.objectKey);
  await fsPromises.mkdir(path.dirname(dest), { recursive: true });

  const { createWriteStream } = await import("node:fs");
  const writeStream = createWriteStream(dest);
  let written = 0;

  req.on("data", (chunk: Buffer) => {
    written += chunk.length;
    if (payload.maxSize > 0 && written > payload.maxSize) {
      req.destroy();
      writeStream.destroy();
      res.status(413).json({ success: false, message: "File too large" });
      return;
    }
    writeStream.write(chunk);
  });

  req.on("end", () => {
    writeStream.end();
    res.status(200).json({ success: true });
  });

  req.on("error", () => {
    writeStream.destroy();
    res.status(500).json({ success: false, message: "Upload failed" });
  });

  writeStream.on("error", () => {
    res.status(500).json({ success: false, message: "Upload failed" });
  });
});

uploadsRouter.get("/get", async (req, res) => {
  const token = String(req.query.token ?? "");
  const payload = verifyUploadToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: "Invalid or expired download token" });
    return;
  }
  const filePath = absolutePath(payload.objectKey);
  res.setHeader("Content-Type", payload.contentType);
  createReadStream(filePath)
    .on("error", () => {
      res.status(404).json({ success: false, message: "File not found" });
    })
    .pipe(res);
});

/** JSON routes only — PUT /put stays raw body (registered above). */
uploadsRouter.use(express.json({ limit: "1mb" }));

uploadsRouter.use(authenticate);

uploadsRouter.post("/presign", requireRole("ARTIST", "ADMIN"), async (req, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed" });
    return;
  }
  try {
    const data = await presignUpload({
      userId: req.auth!.id,
      ...parsed.data,
      resourceType: parsed.data.resourceType as UploadResourceType,
    });
    res.json({ success: true, data });
  } catch (err) {
    if (mapUploadError(err, res)) return;
    throw err;
  }
});

uploadsRouter.post("/complete", requireRole("ARTIST", "ADMIN"), async (req, res) => {
  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: "Validation failed" });
    return;
  }
  try {
    const data = await completeUpload({
      userId: req.auth!.id,
      ...parsed.data,
      resourceType: parsed.data.resourceType as UploadResourceType,
    });
    res.json({ success: true, data });
  } catch (err) {
    if (mapUploadError(err, res)) return;
    throw err;
  }
});
