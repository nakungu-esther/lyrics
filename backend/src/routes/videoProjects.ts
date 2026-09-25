import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { loadCreatorArtist } from "../middleware/loadCreatorArtist.js";
import { createRenderJob } from "../queues/videoRender.js";
import {
  changeVideoProjectTemplate,
  createVideoProject,
  getVideoProjectForOwner,
  listArtistSongsForVideo,
  listVideoProjects,
  updateVideoCustomizations,
} from "../services/videoProjectService.js";

export const videoProjectsRouter = Router();

videoProjectsRouter.use(authenticate);

videoProjectsRouter.get("/songs", loadCreatorArtist, async (req, res) => {
  const songs = await listArtistSongsForVideo(req.artist!.id);
  res.json({ songs });
});

videoProjectsRouter.get("/me", async (req, res) => {
  const projects = await listVideoProjects(req.auth!.id);
  res.json({ projects });
});

videoProjectsRouter.post("/", loadCreatorArtist, async (req, res) => {
  const schema = z.object({
    songId: z.string().uuid(),
    lyricsId: z.string().uuid(),
    templateId: z.string().uuid(),
    exportFormat: z
      .enum(["CANVAS_4_3", "YOUTUBE_16_9", "TIKTOK_9_16", "REELS_9_16", "SQUARE_1_1"])
      .optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }

  try {
    const { exportFormat, ...rest } = parsed.data;
    const project = await createVideoProject({
      ownerUserId: req.auth!.id,
      artistId: req.artist!.id,
      ...rest,
      initialExportFormat: exportFormat,
    });
    res.status(201).json({ project });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    res.status(400).json({ error: { code: "BAD_REQUEST", message: msg } });
  }
});

videoProjectsRouter.get("/:id", async (req, res) => {
  const data = await getVideoProjectForOwner(String(req.params.id), req.auth!.id);
  if (!data) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found" } });
    return;
  }
  res.json(data);
});

videoProjectsRouter.post("/:id/template", async (req, res) => {
  const schema = z.object({ templateId: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "VALIDATION", message: parsed.error.flatten() } });
    return;
  }
  try {
    await changeVideoProjectTemplate(
      String(req.params.id),
      req.auth!.id,
      parsed.data.templateId,
    );
    const data = await getVideoProjectForOwner(String(req.params.id), req.auth!.id);
    res.json(data);
  } catch {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found" } });
  }
});

videoProjectsRouter.patch("/:id/customizations", async (req, res) => {
  try {
    const project = await updateVideoCustomizations(
      String(req.params.id),
      req.auth!.id,
      req.body,
    );
    res.json({ project });
  } catch {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found" } });
  }
});

videoProjectsRouter.post("/:id/render", async (req, res) => {
  const data = await getVideoProjectForOwner(String(req.params.id), req.auth!.id);
  if (!data) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Project not found" } });
    return;
  }
  const bodySchema = z.object({
    exportFormat: z
      .enum(["CANVAS_4_3", "YOUTUBE_16_9", "TIKTOK_9_16", "REELS_9_16", "SQUARE_1_1"])
      .optional(),
    resolutionHeight: z.number().int().optional(),
  });
  const parsed = bodySchema.safeParse(req.body ?? {});
  const renderJobId = await createRenderJob(data.project.id, {
    exportFormat: parsed.success ? parsed.data.exportFormat : undefined,
    resolutionHeight: parsed.success ? parsed.data.resolutionHeight : undefined,
  });
  res.status(202).json({ renderJobId });
});
