import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { trackEvent } from "../services/analyticsService.js";

export const renderJobsRouter = Router();

renderJobsRouter.use(authenticate);

renderJobsRouter.get("/:id", async (req, res) => {
  const job = await prisma.renderJob.findUnique({
    where: { id: String(req.params.id) },
    include: {
      videoProject: { select: { ownerUserId: true, songId: true } },
    },
  });
  if (!job) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    return;
  }
  if (
    req.auth!.role !== "ADMIN" &&
    job.videoProject.ownerUserId !== req.auth!.id
  ) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
    return;
  }

  res.json({
    job: {
      id: job.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      exportFormat: job.exportFormat,
      resolutionHeight: job.resolutionHeight,
      outputVideoUrl: job.outputVideoUrl,
      error: job.error,
    },
  });
});

renderJobsRouter.post("/:id/download", async (req, res) => {
  const job = await prisma.renderJob.findUnique({
    where: { id: String(req.params.id) },
    include: {
      videoProject: {
        include: { song: { select: { id: true, artistId: true } } },
      },
    },
  });
  if (!job?.outputVideoUrl) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "No output" } });
    return;
  }
  if (
    req.auth!.role !== "ADMIN" &&
    job.videoProject.ownerUserId !== req.auth!.id
  ) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
    return;
  }
  await trackEvent({
    eventType: "DOWNLOAD",
    songId: job.videoProject.song.id,
    artistId: job.videoProject.song.artistId,
    userId: req.auth!.id,
    meta: { renderJobId: job.id },
  });
  res.json({ url: job.outputVideoUrl });
});
