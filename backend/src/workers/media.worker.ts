import "dotenv/config";
import {
  markAudioJobFailed,
  startMediaProcessingWorker,
} from "../queues/mediaProcessing.js";

const worker = startMediaProcessingWorker();

if (!worker) {
  console.error("[media.worker] REDIS_URL is required");
  process.exit(1);
}

worker.on("failed", (job, err) => {
  if (!job) return;
  const max = job.opts.attempts ?? 1;
  if (job.attemptsMade < max) return;
  const message = err instanceof Error ? err.message : "Processing failed";
  void markAudioJobFailed(job.data.processingJobId, job.data.songId, message);
});

worker.on("completed", (job) => {
  console.log(`[media.worker] completed ${job.id} (${job.data.jobType})`);
});

console.log("[media.worker] listening on queue: media-processing");
