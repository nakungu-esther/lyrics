import { prisma } from "../lib/prisma.js";
import { runLanguageDetectionJob } from "../services/languageDetectionService.js";
import type { SongPipelinePayload } from "../queues/songProcessing.js";

export async function processLanguageDetect(payload: SongPipelinePayload): Promise<void> {
  const { songId, jobId } = payload;

  await prisma.processingJob.update({
    where: { id: jobId },
    data: {
      status: "PROCESSING",
      progress: 10,
      message: "Detecting language…",
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    const reportProgress = async (progress: number, message: string) => {
      await prisma.processingJob.update({
        where: { id: jobId },
        data: { progress, message },
      });
    };

    await runLanguageDetectionJob({ songId, jobId, reportProgress });

    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        message: "Language detection completed",
        completedAt: new Date(),
        error: null,
      },
    });

    const { continueStudioAfterLanguageDetection } = await import(
      "../services/creatorStudioService.js"
    );
    await continueStudioAfterLanguageDetection(songId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        progress: 100,
        error: message,
        message: "Language detection failed",
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
