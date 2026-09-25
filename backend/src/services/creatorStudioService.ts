import type { ExportFormat } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.js";
import { confirmSongLanguage } from "./songLanguageService.js";
import { getActiveLyrics } from "./lyricsService.js";
import { createVideoProject } from "./videoProjectService.js";
import { enqueueTranscriptionForSong } from "./transcriptionJobService.js";
import { createAudioProcessingJob } from "./processingJobService.js";
import { enqueueMediaProcessingJob } from "../queues/mediaProcessing.js";

export type CreatorStudioMode = "VIDEO_CLIP" | "AUDIO_ONLY";

export function isCreatorStudioMode(value: string | null | undefined): value is CreatorStudioMode {
  return value === "VIDEO_CLIP" || value === "AUDIO_ONLY";
}

export async function markCreatorStudioSong(
  songId: string,
  mode: CreatorStudioMode,
): Promise<void> {
  await prisma.song.update({
    where: { id: songId },
    data: { creatorStudioMode: mode },
  });
}

/** After music video extract: normalize audio and start language detection chain. */
export async function continueStudioAfterMusicVideo(songId: string): Promise<void> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!isCreatorStudioMode(song?.creatorStudioMode)) return;

  const extractedKey = `audio/${songId}/processed.mp3`;
  await prisma.song.update({
    where: { id: songId },
    data: { audioObjectKey: extractedKey },
  });

  const job = await prisma.processingJob.create({
    data: {
      id: uuidv4(),
      songId,
      jobType: "AUDIO",
      status: "QUEUED",
      progress: 0,
      message: "Preparing audio for AI…",
    },
  });

  await enqueueMediaProcessingJob({
    processingJobId: job.id,
    songId,
    jobType: "AUDIO",
    legacySourceRelativePath: extractedKey,
  });
}

export async function continueStudioAfterLanguageDetection(songId: string): Promise<void> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!isCreatorStudioMode(song?.creatorStudioMode)) return;

  if (!song.languageConfirmed && song.detectedLanguageCode) {
    const artist = await prisma.artist.findUniqueOrThrow({ where: { id: song.artistId } });
    await confirmSongLanguage(songId, artist.ownerUserId, {
      languages: [song.detectedLanguageCode],
    });
  }

  await enqueueTranscriptionForSong(songId);
}

function defaultTemplateForMode(mode: CreatorStudioMode): string {
  return mode === "VIDEO_CLIP" ? "music-video-overlay" : "classic";
}

function defaultExportForMode(_mode: CreatorStudioMode): ExportFormat {
  return "CANVAS_4_3";
}

export async function ensureStudioVideoProject(songId: string): Promise<string | null> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!isCreatorStudioMode(song?.creatorStudioMode)) return null;

  const lyrics = await getActiveLyrics(songId);
  if (!lyrics) return null;

  const artist = await prisma.artist.findUniqueOrThrow({ where: { id: song!.artistId } });
  const ownerUserId = artist.ownerUserId;

  const existing = await prisma.videoProject.findFirst({
    where: { songId, ownerUserId },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing.id;

  const mode = song!.creatorStudioMode as CreatorStudioMode;
  const template = await prisma.videoTemplate.findFirst({
    where: { slug: defaultTemplateForMode(mode), isActive: true },
  });
  if (!template) return null;

  const project = await createVideoProject({
    ownerUserId,
    artistId: song!.artistId,
    songId,
    lyricsId: lyrics.id,
    templateId: template.id,
    initialExportFormat: defaultExportForMode(mode),
  });

  return project.id;
}

export type StudioPipelinePhase =
  | "UPLOADING"
  | "EXTRACTING_AUDIO"
  | "ANALYZING_AUDIO"
  | "DETECTING_LANGUAGE"
  | "TRANSCRIBING"
  | "SYNCING_LYRICS"
  | "READY"
  | "FAILED";

export async function getStudioPipelineStatus(songId: string): Promise<{
  phase: StudioPipelinePhase;
  message: string;
  progress: number;
  projectId: string | null;
}> {
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) {
    return { phase: "FAILED", message: "Song not found", progress: 0, projectId: null };
  }

  const failed = await prisma.processingJob.findFirst({
    where: { songId, status: "FAILED" },
    orderBy: { updatedAt: "desc" },
  });
  if (failed && song.status !== "READY_FOR_REVIEW") {
    return {
      phase: "FAILED",
      message: failed.message ?? failed.error ?? "Processing failed",
      progress: failed.progress,
      projectId: null,
    };
  }

  const project = await prisma.videoProject.findFirst({
    where: { songId },
    orderBy: { createdAt: "desc" },
  });
  if (project && (await getActiveLyrics(songId))) {
    return {
      phase: "READY",
      message: "AI finished — customize your video",
      progress: 100,
      projectId: project.id,
    };
  }

  const transcribe = await prisma.processingJob.findFirst({
    where: { songId, jobType: "TRANSCRIBE", status: { in: ["QUEUED", "PROCESSING"] } },
  });
  if (transcribe) {
    return {
      phase: "TRANSCRIBING",
      message: transcribe.message ?? "Generating & synchronizing lyrics…",
      progress: transcribe.progress,
      projectId: null,
    };
  }

  const lang = await prisma.processingJob.findFirst({
    where: {
      songId,
      jobType: { in: ["LANGUAGE", "LANGUAGE_DETECTION"] },
      status: { in: ["QUEUED", "PROCESSING"] },
    },
  });
  if (lang) {
    return {
      phase: "DETECTING_LANGUAGE",
      message: lang.message ?? "Detecting language…",
      progress: lang.progress,
      projectId: null,
    };
  }

  const audio = await prisma.processingJob.findFirst({
    where: { songId, jobType: "AUDIO", status: { in: ["QUEUED", "PROCESSING"] } },
  });
  if (audio) {
    return {
      phase: "ANALYZING_AUDIO",
      message: audio.message ?? "Analyzing audio…",
      progress: audio.progress,
      projectId: null,
    };
  }

  const mv = await prisma.processingJob.findFirst({
    where: { songId, jobType: "MUSIC_VIDEO", status: { in: ["QUEUED", "PROCESSING"] } },
  });
  if (mv) {
    return {
      phase: song.creatorStudioMode === "VIDEO_CLIP" ? "EXTRACTING_AUDIO" : "UPLOADING",
      message: mv.message ?? "Processing your clip…",
      progress: mv.progress,
      projectId: null,
    };
  }

  if (!song.processedAudioObjectKey) {
    return {
      phase: "UPLOADING",
      message: "Starting…",
      progress: 5,
      projectId: null,
    };
  }

  return {
    phase: "SYNCING_LYRICS",
    message: "Finishing lyrics sync…",
    progress: 85,
    projectId: project?.id ?? null,
  };
}

/** Audio-only studio start after file lands in storage. */
export async function startStudioAudioProcessing(songId: string): Promise<void> {
  await createAudioProcessingJob(songId);
}
