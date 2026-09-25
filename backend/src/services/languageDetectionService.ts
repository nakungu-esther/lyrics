import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import type { ProcessingJobType } from "@prisma/client";
import { getLanguageDetectionProvider } from "../ai/languageDetection/index.js";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { getStorageProvider } from "../storage/index.js";
import { enqueuePipelineJob } from "../queues/songProcessing.js";

const LANGUAGE_JOB_TYPE: ProcessingJobType = "LANGUAGE_DETECTION";

export async function createLanguageDetectionJob(songId: string): Promise<string> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song?.processedAudioObjectKey) {
    throw new Error("Processed audio required before language detection");
  }

  const active = await prisma.processingJob.findFirst({
    where: {
      songId,
      jobType: { in: ["LANGUAGE", "LANGUAGE_DETECTION"] },
      status: { in: ["QUEUED", "PROCESSING"] },
    },
  });
  if (active) return active.id;

  const job = await prisma.processingJob.create({
    data: {
      id: uuidv4(),
      songId,
      jobType: LANGUAGE_JOB_TYPE,
      status: "QUEUED",
      progress: 0,
      message: "Queued for language detection",
    },
  });

  await enqueuePipelineJob({
    songId,
    jobId: job.id,
    jobType: LANGUAGE_JOB_TYPE,
  });

  return job.id;
}

export async function retryLanguageDetectionJob(songId: string, userId: string): Promise<string> {
  const { assertSongOwnedByUser } = await import("./songService.js");
  await assertSongOwnedByUser(songId, userId);

  await prisma.processingJob.updateMany({
    where: {
      songId,
      jobType: { in: ["LANGUAGE", "LANGUAGE_DETECTION"] },
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    data: {
      status: "FAILED",
      message: "Superseded by retry",
      completedAt: new Date(),
    },
  });

  return createLanguageDetectionJob(songId);
}

function tempDir(jobId: string): string {
  const base = env.workerTempDir || path.join(os.tmpdir(), "lyricshub");
  return path.join(base, `lang-${jobId}`);
}

export async function runLanguageDetectionJob(input: {
  songId: string;
  jobId: string;
  reportProgress: (progress: number, message: string) => Promise<void>;
}): Promise<void> {
  const { songId, jobId, reportProgress } = input;
  const workDir = tempDir(jobId);
  const localPath = path.join(workDir, "processed.wav");

  await fs.mkdir(workDir, { recursive: true });

  try {
    await reportProgress(5, "Preparing language detection");

    const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });
    const objectKey = song.processedAudioObjectKey;
    if (!objectKey) {
      throw new Error("Processed audio not found");
    }

    const storage = getStorageProvider();
    await reportProgress(15, "Loading processed audio");
    await storage.getObjectToFile(objectKey, localPath);

    const durationSeconds = song.durationSeconds ?? 0;
    await reportProgress(35, "Analyzing language");

    const provider = getLanguageDetectionProvider();
    const result = await provider.detectLanguage({
      localAudioPath: localPath,
      durationSeconds,
      songId,
    });

    const threshold = env.languageDetectionConfidenceThreshold;
    const needsConfirmation = result.primary.confidence < threshold;
    const languageState = needsConfirmation ? "CONFIRMATION_REQUIRED" : "DETECTED";

    await reportProgress(70, "Saving detection results");

    await prisma.$transaction(async (tx) => {
      await tx.languageDetectionRun.create({
        data: {
          songId,
          processingJobId: jobId,
          primaryLanguageCode: result.primary.languageCode,
          confidence: result.primary.confidence,
          alternatives: result.alternatives,
          segmentSnapshot: result.segments ?? undefined,
          providerName: result.providerName,
        },
      });

      if (result.segments?.length) {
        await tx.languageSegment.deleteMany({
          where: { songId, source: "AI_DETECTED" },
        });
        for (const seg of result.segments) {
          await tx.languageSegment.create({
            data: {
              songId,
              languageCode: seg.languageCode,
              startTime: seg.startTime,
              endTime: seg.endTime,
              confidence: seg.confidence,
              source: "AI_DETECTED",
            },
          });
        }
      }

      await tx.song.update({
        where: { id: songId },
        data: {
          detectedLanguageCode: result.primary.languageCode,
          languageConfidence: result.primary.confidence,
          languageConfirmed: false,
          languageState,
          status: "AUDIO_READY",
        },
      });
    });

    await reportProgress(95, "Finalizing");
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
