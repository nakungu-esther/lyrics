import { Queue, Worker, type Job } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import type { ExportFormat } from "@prisma/client";
import { clampResolution } from "../lib/exportFormats.js";
import { canUseRedisQueue, getRedisConnection, invalidateRedisQueueCache } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { processVideoRender } from "../worker/processVideoRender.js";

export const VIDEO_RENDER_QUEUE = "video-render";

export type VideoRenderPayload = {
  renderJobId: string;
  videoProjectId: string;
};

let queue: Queue<VideoRenderPayload> | null = null;

export function getVideoRenderQueue(): Queue<VideoRenderPayload> | null {
  const connection = getRedisConnection();
  if (!connection) return null;
  if (!queue) {
    queue = new Queue(VIDEO_RENDER_QUEUE, { connection });
  }
  return queue;
}

async function runRender(payload: VideoRenderPayload): Promise<void> {
  await processVideoRender(payload);
}

export async function enqueueVideoRender(payload: VideoRenderPayload): Promise<void> {
  if (await canUseRedisQueue()) {
    const q = getVideoRenderQueue();
    if (q) {
      try {
        await q.add("render", payload, {
          removeOnComplete: 50,
          removeOnFail: 25,
          jobId: payload.renderJobId,
        });
        return;
      } catch (err) {
        invalidateRedisQueueCache();
        console.warn(
          "[redis] render enqueue failed, running inline:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }
  setImmediate(() => {
    void runRender(payload);
  });
}

export async function createRenderJob(
  videoProjectId: string,
  options?: { exportFormat?: ExportFormat; resolutionHeight?: number },
): Promise<string> {
  const job = await prisma.renderJob.create({
    data: {
      id: uuidv4(),
      videoProjectId,
      status: "QUEUED",
      progress: 0,
      message: "Queued",
      exportFormat: options?.exportFormat ?? "CANVAS_4_3",
      resolutionHeight: clampResolution(options?.resolutionHeight ?? 1080),
    },
  });

  await enqueueVideoRender({
    renderJobId: job.id,
    videoProjectId,
  });

  return job.id;
}

export function startVideoRenderWorker(): Worker<VideoRenderPayload> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  return new Worker<VideoRenderPayload>(
    VIDEO_RENDER_QUEUE,
    async (job: Job<VideoRenderPayload>) => {
      await runRender(job.data);
    },
    { connection },
  );
}
