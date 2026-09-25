import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { getArtistForUser } from "../services/artistService.js";

export const jobsRouter = Router();

jobsRouter.use(authenticate);

jobsRouter.get("/:id", async (req, res) => {
  const jobId = String(req.params.id);
  const job = await prisma.processingJob.findUnique({
    where: { id: jobId },
    include: { song: { select: { id: true, title: true, status: true, artistId: true } } },
  });
  if (!job) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    return;
  }

  const artist = await getArtistForUser(req.auth!.id);
  if (
    req.auth!.role !== "ADMIN" &&
    (!artist || job.song.artistId !== artist.id)
  ) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
    return;
  }

  res.json({
    job: {
      id: job.id,
      jobType: job.jobType,
      status: job.status,
      progress: job.progress,
      message: job.message,
      error: job.error,
      song: job.song,
    },
  });
});
