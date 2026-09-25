import type { ProcessingJobType } from "@prisma/client";
import { Queue, Worker, type Job } from "bullmq";
import { env } from "../config/env.js";
import { canUseRedisQueue, getRedisConnection, invalidateRedisQueueCache } from "../lib/redis.js";
import { runAudioProcessingJob } from "../services/audioProcessingService.js";
import { prisma } from "../lib/prisma.js";
import { MEDIA_PROCESSING_QUEUE } from "./queueNames.js";

export type MediaProcessingPayload = {
  processingJobId: string;
  songId: string;
  jobType: ProcessingJobType;
  legacySourceRelativePath?: string;
};

let queue: Queue<MediaProcessingPayload> | null = null;

export function getMediaProcessingQueue(): Queue<MediaProcessingPayload> | null {
  const connection = getRedisConnection();
  if (!connection) return null;
  if (!queue) {
    queue = new Queue(MEDIA_PROCESSING_QUEUE, { connection });
  }
  return queue;
}

export async function enqueueMediaProcessingJob(
  payload: MediaProcessingPayload,
): Promise<void> {
  if (await canUseRedisQueue()) {
    const q = getMediaProcessingQueue();
    if (q) {
      try {
        await q.add(payload.jobType, payload, {
          jobId: payload.processingJobId,
          attempts: env.bullmqJobAttempts,
          backoff: { type: "exponential", delay: env.bullmqBackoffMs },
          removeOnComplete: 200,
          removeOnFail: 100,
        });
        return;
      } catch (err) {
        invalidateRedisQueueCache();
        console.warn(
          "[redis] media enqueue failed, running inline:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  setImmediate(() => {
    void executeMediaJob(payload);
  });
}

export async function markAudioJobFailed(
  jobId: string,
  songId: string,
  message: string,
): Promise<void> {
  await prisma.processingJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      progress: 100,
      error: message,
      message: "Audio processing failed",
      completedAt: new Date(),
    },
  });
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (song?.status === "PROCESSING" && !song.processedAudioObjectKey) {
    await prisma.song.update({
      where: { id: songId },
      data: { status: "DRAFT" },
    });
  }
}

export async function executeMediaJob(payload: MediaProcessingPayload): Promise<void> {
  const { processingJobId, songId, jobType, legacySourceRelativePath } = payload;

  if (jobType !== "AUDIO") {
    throw new Error(`Job type ${jobType} is not enabled in Step 8`);
  }

  const jobRow = await prisma.processingJob.findUnique({
    where: { id: processingJobId },
  });
  if (!jobRow) {
    throw new Error("Processing job not found");
  }

  if (jobRow.status === "COMPLETED") {
    return;
  }

  await prisma.processingJob.update({
    where: { id: processingJobId },
    data: {
      status: "PROCESSING",
      startedAt: jobRow.startedAt ?? new Date(),
      attempts: { increment: 1 },
      message: "Preparing",
    },
  });

  await prisma.song.update({
    where: { id: songId },
    data: { status: "PROCESSING" },
  });

  const reportProgress = async (progress: number, message: string) => {
    await prisma.processingJob.update({
      where: { id: processingJobId },
      data: { progress, message },
    });
  };

  await runAudioProcessingJob({
    songId,
    jobId: processingJobId,
    legacySourceRelativePath,
    reportProgress,
  });

  await prisma.processingJob.update({
    where: { id: processingJobId },
    data: {
      status: "COMPLETED",
      progress: 100,
      message: "Audio processing completed",
      completedAt: new Date(),
      error: null,
    },
  });

  const { createLanguageDetectionJob } = await import(
    "../services/languageDetectionService.js"
  );
  await createLanguageDetectionJob(songId);
}

export function startMediaProcessingWorker(): Worker<MediaProcessingPayload> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  return new Worker<MediaProcessingPayload>(
    MEDIA_PROCESSING_QUEUE,
    async (job: Job<MediaProcessingPayload>) => {
      await executeMediaJob(job.data);
    },
    {
      connection,
      concurrency: env.mediaWorkerConcurrency,
    },
  );
}
