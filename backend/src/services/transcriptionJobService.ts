import { prisma } from "../lib/prisma.js";
import { createAndEnqueueJob } from "../queues/songProcessing.js";
import { SongServiceError } from "./songService.js";

export async function enqueueTranscriptionForSong(songId: string): Promise<string | null> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) return null;

  const audioKey = song.processedAudioObjectKey ?? song.audioObjectKey;
  if (!audioKey) return null;

  const existing = await prisma.processingJob.findFirst({
    where: {
      songId,
      jobType: "TRANSCRIBE",
      status: { in: ["QUEUED", "PROCESSING"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing.id;

  return createAndEnqueueJob(songId, "TRANSCRIBE", "Queued for AI transcription…", {
    processedAudioPath: audioKey,
  });
}

export async function retryTranscriptionForSong(
  songId: string,
  userId: string,
): Promise<{ jobId: string | null }> {
  const song = await prisma.song.findFirst({
    where: { id: songId, artist: { ownerUserId: userId } },
  });
  if (!song) {
    throw new SongServiceError("NOT_FOUND", "Song not found");
  }
  if (!song.languageConfirmed) {
    throw new SongServiceError("VALIDATION", "Confirm language before transcription");
  }
  const jobId = await enqueueTranscriptionForSong(songId);
  if (!jobId) {
    throw new SongServiceError("VALIDATION", "Upload and process audio first");
  }
  return { jobId };
}
