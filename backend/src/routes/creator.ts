import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { loadCreatorArtist } from "../middleware/loadCreatorArtist.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { uniqueSongSlug } from "../lib/slug.js";
import { saveUploadedFile } from "../lib/storage.js";
import { enqueuePipelineJob } from "../queues/songProcessing.js";
import {
  markCreatorStudioSong,
  startStudioAudioProcessing,
} from "../services/creatorStudioService.js";
import { saveMusicVideoUpload } from "../worker/processMusicVideo.js";

const upload = multer({
  dest: path.join(env.storageRoot, "temp"),
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const creatorRouter = Router();

creatorRouter.use(authenticate);

creatorRouter.post("/setup", loadCreatorArtist, asyncHandler(async (req, res) => {
  res.json({
    artist: req.artist,
    message: "Nyimba Studio ready.",
  });
}));

const startSchema = z.object({
  mode: z.enum(["VIDEO_CLIP", "AUDIO_ONLY"]),
  title: z.string().min(1).max(200),
  genre: z.string().max(80).optional(),
});

/**
 * Core create flow: upload video OR audio → redirect to /studio/:songId
 * AI pipeline runs automatically (extract → detect → transcribe → initial project).
 */
creatorRouter.post(
  "/start",
  loadCreatorArtist,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
      return;
    }

    const files = req.files as { video?: Express.Multer.File[]; audio?: Express.Multer.File[] };
    const { mode, title, genre } = parsed.data;

    if (mode === "VIDEO_CLIP" && !files.video?.[0]) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Video clip required" } });
      return;
    }
    if (mode === "AUDIO_ONLY" && !files.audio?.[0]) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Audio file required" } });
      return;
    }

    const artist = req.artist!;
    const slug = await uniqueSongSlug(artist.id, title, async (s) =>
      Boolean(await prisma.song.findFirst({ where: { artistId: artist.id, slug: s } })),
    );
    const songId = uuidv4();

    if (mode === "VIDEO_CLIP") {
      const videoFile = files.video![0]!;
      const sourceKey = await saveMusicVideoUpload(videoFile.path, songId, videoFile.originalname);

      await prisma.song.create({
        data: {
          id: songId,
          artistId: artist.id,
          title: title.trim(),
          slug,
          genre: genre?.trim(),
          mediaSource: "MUSIC_VIDEO",
          creatorStudioMode: "VIDEO_CLIP",
          status: "PROCESSING",
        },
      });

      await prisma.songArtist.create({
        data: { songId, artistId: artist.id, role: "primary" },
      });

      const job = await prisma.processingJob.create({
        data: {
          songId,
          jobType: "MUSIC_VIDEO",
          status: "QUEUED",
          progress: 0,
          message: "Uploading clip…",
        },
      });

      await enqueuePipelineJob({
        songId,
        jobId: job.id,
        jobType: "MUSIC_VIDEO",
        sourceRelativePath: sourceKey,
      });
    } else {
      const audioFile = files.audio![0]!;
      const ext = path.extname(audioFile.originalname) || ".mp3";
      const audioKey = `songs/${songId}/audio/original/upload${ext}`;
      const audioUrl = await saveUploadedFile(audioFile.path, audioKey);

      await prisma.song.create({
        data: {
          id: songId,
          artistId: artist.id,
          title: title.trim(),
          slug,
          genre: genre?.trim(),
          mediaSource: "AUDIO",
          creatorStudioMode: "AUDIO_ONLY",
          audioObjectKey: audioKey,
          audioUrl,
          status: "PROCESSING",
        },
      });

      await prisma.songArtist.create({
        data: { songId, artistId: artist.id, role: "primary" },
      });

      await markCreatorStudioSong(songId, "AUDIO_ONLY");
      await startStudioAudioProcessing(songId);
    }

    res.status(201).json({
      songId,
      studioUrl: `/studio/${songId}`,
      mode,
    });
  }),
);

/** @deprecated Use POST /start with mode=VIDEO_CLIP */
creatorRouter.post(
  "/clip",
  loadCreatorArtist,
  upload.single("video"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: { code: "VALIDATION", message: "Video clip required" } });
      return;
    }
    (req as { files?: unknown }).files = { video: [req.file] };
    req.body = { ...req.body, mode: "VIDEO_CLIP" };
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
      return;
    }
    res.status(400).json({
      error: {
        code: "DEPRECATED",
        message: "Use POST /api/v1/creator/start with mode VIDEO_CLIP",
      },
    });
  }),
);
