import type { ProcessingJobType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.js";
import { enqueueMediaProcessingJob } from "../queues/mediaProcessing.js";
import { assertSongOwnedByUser, SongServiceError } from "./songService.js";

export type ProcessingStatusView = {
  jobId: string | null;
  jobType: ProcessingJobType | null;
  status: "IDLE" | "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  stage: string;
  error: string | null;
  songStatus: string;
  processedAudioReady: boolean;
};

const STAGE_BY_PROGRESS: Array<{ min: number; label: string }> = [
  { min: 0, label: "Preparing" },
  { min: 10, label: "Inspecting audio" },
  { min: 25, label: "Processing audio" },
  { min: 75, label: "Uploading processed audio" },
  { min: 90, label: "Finalizing" },
  { min: 100, label: "Completed" },
];

export function stageLabel(progress: number, message: string | null): string {
  if (message?.trim()) return message;
  let label = STAGE_BY_PROGRESS[0]?.label ?? "Preparing";
  for (const row of STAGE_BY_PROGRESS) {
    if (progress >= row.min) label = row.label;
  }
  return label;
}

export async function createAudioProcessingJob(songId: string): Promise<string> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song?.audioObjectKey) {
    throw new SongServiceError("VALIDATION", "Upload audio before processing");
  }

  const active = await prisma.processingJob.findFirst({
    where: {
      songId,
      jobType: "AUDIO",
      status: { in: ["QUEUED", "PROCESSING"] },
    },
  });
  if (active) {
    return active.id;
  }

  const job = await prisma.processingJob.create({
    data: {
      id: uuidv4(),
      songId,
      jobType: "AUDIO",
      status: "QUEUED",
      progress: 0,
      message: "Queued for audio processing",
    },
  });

  await prisma.song.update({
    where: { id: songId },
    data: { status: "PROCESSING" },
  });

  await enqueueMediaProcessingJob({
    processingJobId: job.id,
    songId,
    jobType: "AUDIO",
  });

  return job.id;
}

export async function retryAudioProcessing(songId: string, userId: string): Promise<string> {
  await assertSongOwnedByUser(songId, userId);
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song?.audioObjectKey) {
    throw new SongServiceError("VALIDATION", "No original audio to process");
  }

  await prisma.processingJob.updateMany({
    where: {
      songId,
      jobType: "AUDIO",
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    data: {
      status: "FAILED",
      message: "Superseded by retry",
      completedAt: new Date(),
    },
  });

  return createAudioProcessingJob(songId);
}

export async function getAudioProcessingStatus(
  songId: string,
  userId: string,
): Promise<ProcessingStatusView> {
  await assertSongOwnedByUser(songId, userId);

  const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });

  const job = await prisma.processingJob.findFirst({
    where: { songId, jobType: "AUDIO" },
    orderBy: { createdAt: "desc" },
  });

  if (!job) {
    return {
      jobId: null,
      jobType: null,
      status: song.processedAudioObjectKey ? "COMPLETED" : "IDLE",
      progress: song.processedAudioObjectKey ? 100 : 0,
      stage: song.processedAudioObjectKey ? "Completed" : "Waiting for audio upload",
      error: null,
      songStatus: song.status,
      processedAudioReady: Boolean(song.processedAudioObjectKey),
    };
  }

  const status =
    job.status === "QUEUED"
      ? "QUEUED"
      : job.status === "PROCESSING"
        ? "PROCESSING"
        : job.status === "COMPLETED"
          ? "COMPLETED"
          : job.status === "FAILED"
            ? "FAILED"
            : "IDLE";

  return {
    jobId: job.id,
    jobType: job.jobType,
    status,
    progress: job.progress,
    stage: stageLabel(job.progress, job.message),
    error: job.error,
    songStatus: song.status,
    processedAudioReady: Boolean(song.processedAudioObjectKey),
  };
}
