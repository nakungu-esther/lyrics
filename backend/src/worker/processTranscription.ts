import { transcribeAudioFile } from "../ai/providers.js";
import { prisma } from "../lib/prisma.js";
import { absolutePath } from "../lib/storage.js";
import { createLyricsFromTranscription } from "../services/lyricsService.js";
import type { SongPipelinePayload } from "../queues/songProcessing.js";

export async function processTranscription(payload: SongPipelinePayload): Promise<void> {
  const { songId, jobId } = payload;

  const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });
  const audioRelative =
    payload.processedAudioPath ??
    song.processedAudioObjectKey ??
    song.audioObjectKey ??
    `songs/${songId}/audio/processed/master.wav`;
  const languageCode = song.primaryLanguageCode ?? song.detectedLanguageCode ?? "lg";

  await prisma.processingJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", progress: 15, message: "Transcribing (AI)…" },
  });

  try {
    const result = await transcribeAudioFile(
      absolutePath(audioRelative),
      languageCode,
    );

    await prisma.processingJob.update({
      where: { id: jobId },
      data: { progress: 70, message: "Saving lyrics…" },
    });

    await createLyricsFromTranscription(songId, languageCode, result.segments);

    await prisma.song.update({
      where: { id: songId },
      data: { status: "READY_FOR_REVIEW" },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        message: "Transcription ready",
      },
    });

    const { ensureStudioVideoProject } = await import("../services/creatorStudioService.js");
    await ensureStudioVideoProject(songId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        progress: 100,
        error: message,
        message: "Transcription failed",
      },
    });
  }
}
