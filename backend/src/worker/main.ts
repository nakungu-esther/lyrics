import "dotenv/config";

import { env } from "../config/env.js";
import { pingRedis } from "../lib/redis.js";
import { startMediaProcessingWorker, markAudioJobFailed } from "../queues/mediaProcessing.js";
import { startSongProcessingWorker } from "../queues/songProcessing.js";
import { startVideoRenderWorker } from "../queues/videoRender.js";

async function main(): Promise<void> {
  if (!env.redisUrl?.trim()) {
    console.error(
      "[worker] REDIS_URL is not set. Add REDIS_URL=redis://127.0.0.1:6379 to backend/.env, or run API-only: npm run dev",
    );
    process.exit(1);
  }

  const redisOk = await pingRedis();
  if (!redisOk) {
    console.error(
      `\n[worker] Cannot connect to Redis (${env.redisUrl}).\n` +
        "  1. Start Docker Desktop, then from the repo root: docker-compose up -d\n" +
        "  2. Or install Redis locally on port 6379\n" +
        "  3. For light testing without a worker, remove REDIS_URL from backend/.env (jobs run inline in the API)\n",
    );
    process.exit(1);
  }

  const mediaWorker = startMediaProcessingWorker();
  const pipelineWorker = startSongProcessingWorker();
  const videoWorker = startVideoRenderWorker();

  if (!mediaWorker && !pipelineWorker && !videoWorker) {
    console.error("[worker] No workers started (check REDIS_URL).");
    process.exit(1);
  }

  mediaWorker?.on("failed", (job, err) => {
    if (!job) return;
    const max = job.opts.attempts ?? 1;
    if (job.attemptsMade < max) return;
    const message = err instanceof Error ? err.message : "Processing failed";
    void markAudioJobFailed(job.data.processingJobId, job.data.songId, message);
  });

  for (const w of [mediaWorker, pipelineWorker, videoWorker]) {
    w?.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  }

  console.log("[worker] Ready — media-processing, song-pipeline (legacy), video-render");
}

main().catch((err) => {
  console.error("[worker] Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
