import type { ProcessingJobType } from "@prisma/client";

import { Queue, Worker, type Job } from "bullmq";

import { v4 as uuidv4 } from "uuid";

import { prisma } from "../lib/prisma.js";

import { canUseRedisQueue, getRedisConnection, invalidateRedisQueueCache } from "../lib/redis.js";

import { enqueueMediaProcessingJob } from "./mediaProcessing.js";

import { processLanguageDetect } from "../worker/processLanguageDetect.js";

import { processMusicVideo } from "../worker/processMusicVideo.js";

import { processTranscription } from "../worker/processTranscription.js";



/** Legacy queue for language / transcription / music-video (not Step 8). */

export const SONG_PIPELINE_QUEUE = "song-pipeline";



export type SongPipelinePayload = {

  songId: string;

  jobId: string;

  jobType: ProcessingJobType;

  sourceRelativePath?: string;

  processedAudioPath?: string;

};



export type SongAudioJobPayload = {

  songId: string;

  jobId: string;

  sourceRelativePath: string;

};



let queue: Queue<SongPipelinePayload> | null = null;



function getPipelineQueue(): Queue<SongPipelinePayload> | null {

  const connection = getRedisConnection();

  if (!connection) return null;

  if (!queue) {

    queue = new Queue(SONG_PIPELINE_QUEUE, { connection });

  }

  return queue;

}



async function runPipeline(payload: SongPipelinePayload): Promise<void> {

  switch (payload.jobType) {

    case "LANGUAGE":
    case "LANGUAGE_DETECTION":
      await processLanguageDetect(payload);
      break;

    case "TRANSCRIBE":

      await processTranscription(payload);

      break;

    case "MUSIC_VIDEO":

      await processMusicVideo(payload);

      break;

    case "AUDIO":

      await enqueueMediaProcessingJob({

        processingJobId: payload.jobId,

        songId: payload.songId,

        jobType: "AUDIO",

        legacySourceRelativePath: payload.sourceRelativePath,

      });

      break;

    default:

      throw new Error(`Unknown job type: ${payload.jobType}`);

  }

}



export async function enqueuePipelineJob(payload: SongPipelinePayload): Promise<void> {

  if (payload.jobType === "AUDIO") {

    await enqueueMediaProcessingJob({

      processingJobId: payload.jobId,

      songId: payload.songId,

      jobType: "AUDIO",

      legacySourceRelativePath: payload.sourceRelativePath,

    });

    return;

  }



  if (await canUseRedisQueue()) {
    const q = getPipelineQueue();
    if (q) {
      try {
        await q.add(payload.jobType, payload, {
          removeOnComplete: 100,
          removeOnFail: 50,
          jobId: payload.jobId,
        });
        return;
      } catch (err) {
        invalidateRedisQueueCache();
        console.warn(
          "[redis] pipeline enqueue failed, running inline:",
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  setImmediate(() => {
    void runPipeline(payload);
  });

}



export async function enqueueSongProcessing(

  payload: SongAudioJobPayload,

): Promise<void> {

  await enqueueMediaProcessingJob({

    processingJobId: payload.jobId,

    songId: payload.songId,

    jobType: "AUDIO",

    legacySourceRelativePath: payload.sourceRelativePath,

  });

}



export async function createAndEnqueueJob(

  songId: string,

  jobType: ProcessingJobType,

  message: string,

  extra?: Partial<SongPipelinePayload>,

): Promise<string> {

  const job = await prisma.processingJob.create({

    data: {

      id: uuidv4(),

      songId,

      jobType,

      status: "QUEUED",

      progress: 0,

      message,

    },

  });



  await enqueuePipelineJob({

    songId,

    jobId: job.id,

    jobType,

    ...extra,

  });



  return job.id;

}



export function startSongProcessingWorker(): Worker<SongPipelinePayload> | null {

  const connection = getRedisConnection();

  if (!connection) return null;



  return new Worker<SongPipelinePayload>(

    SONG_PIPELINE_QUEUE,

    async (job: Job<SongPipelinePayload>) => {

      await runPipeline(job.data);

    },

    { connection },

  );

}

