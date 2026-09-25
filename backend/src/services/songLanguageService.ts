import type { LanguageSegmentSource, SongLanguageState } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { languageDisplayName, normalizeLanguageCode } from "../lib/languageCodes.js";
import { languageMeta } from "../lib/languageCatalog.js";
import { assertSongOwnedByUser, SongServiceError } from "./songService.js";

export type LanguageSegmentView = {
  id: string;
  languageCode: string;
  languageName: string;
  startTime: number;
  endTime: number;
  confidence: number | null;
  source: LanguageSegmentSource;
};

export type SongLanguageStatus = {
  languageState: SongLanguageState;
  confirmationRequired: boolean;
  detected: {
    languageCode: string | null;
    languageName: string | null;
    confidence: number | null;
    flag: string | null;
  };
  confirmed: {
    languageCode: string | null;
    languageName: string | null;
    confirmedAt: string | null;
    source: "ARTIST_CONFIRMED" | null;
  };
  aiHistory: Array<{
    id: string;
    languageCode: string;
    languageName: string;
    confidence: number;
    createdAt: string;
    alternatives: Array<{ languageCode: string; confidence: number }>;
  }>;
  segments: {
    ai: LanguageSegmentView[];
    confirmed: LanguageSegmentView[];
  };
  processingJob: {
    id: string;
    status: string;
    progress: number;
    message: string | null;
    error: string | null;
  } | null;
  readyForTranscription: boolean;
};

function mapSegment(row: {
  id: string;
  languageCode: string;
  startTime: number;
  endTime: number;
  confidence: number | null;
  source: LanguageSegmentSource;
}): LanguageSegmentView {
  return {
    id: row.id,
    languageCode: row.languageCode,
    languageName: languageDisplayName(row.languageCode),
    startTime: row.startTime,
    endTime: row.endTime,
    confidence: row.confidence,
    source: row.source,
  };
}

export async function getSongLanguageStatus(
  songId: string,
  userId: string | undefined,
): Promise<SongLanguageStatus> {
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { artist: true },
  });
  if (!song) {
    throw new SongServiceError("NOT_FOUND", "Song not found");
  }

  const isOwner = userId && song.artist.ownerUserId === userId;
  if (!isOwner && song.status !== "PUBLISHED") {
    throw new SongServiceError("FORBIDDEN", "Not allowed");
  }

  const runs = await prisma.languageDetectionRun.findMany({
    where: { songId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const segments = await prisma.languageSegment.findMany({
    where: { songId },
    orderBy: { startTime: "asc" },
  });

  const job = await prisma.processingJob.findFirst({
    where: { songId, jobType: { in: ["LANGUAGE", "LANGUAGE_DETECTION"] } },
    orderBy: { createdAt: "desc" },
  });

  const detectedMeta = song.detectedLanguageCode
    ? languageMeta(song.detectedLanguageCode)
    : null;

  const confirmedMeta = song.primaryLanguageCode
    ? languageMeta(song.primaryLanguageCode)
    : null;

  const aiHistory = runs.map((run) => ({
    id: run.id,
    languageCode: run.primaryLanguageCode,
    languageName: languageDisplayName(run.primaryLanguageCode),
    confidence: run.confidence,
    createdAt: run.createdAt.toISOString(),
    alternatives: Array.isArray(run.alternatives)
      ? (run.alternatives as Array<{ languageCode: string; confidence: number }>)
      : [],
  }));

  const publicConfirmedOnly = !isOwner;

  return {
    languageState: song.languageState,
    confirmationRequired:
      song.languageState === "CONFIRMATION_REQUIRED" ||
      (song.languageState === "DETECTED" && !song.languageConfirmed),
    detected: publicConfirmedOnly
      ? {
          languageCode: song.languageConfirmed ? song.primaryLanguageCode : null,
          languageName: song.languageConfirmed ? confirmedMeta?.name ?? null : null,
          confidence: null,
          flag: song.languageConfirmed ? confirmedMeta?.flag ?? null : null,
        }
      : {
          languageCode: song.detectedLanguageCode,
          languageName: detectedMeta?.name ?? null,
          confidence: song.languageConfidence,
          flag: detectedMeta?.flag ?? null,
        },
    confirmed: {
      languageCode: song.languageConfirmed ? song.primaryLanguageCode : null,
      languageName: song.languageConfirmed ? confirmedMeta?.name ?? null : null,
      confirmedAt: song.languageConfirmedAt?.toISOString() ?? null,
      source: song.languageConfirmed ? "ARTIST_CONFIRMED" : null,
    },
    aiHistory: publicConfirmedOnly ? [] : aiHistory,
    segments: {
      ai: publicConfirmedOnly
        ? []
        : segments.filter((s) => s.source === "AI_DETECTED").map(mapSegment),
      confirmed: segments.filter((s) => s.source === "ARTIST_CONFIRMED").map(mapSegment),
    },
    processingJob:
      !isOwner || !job
        ? null
        : {
            id: job.id,
            status: job.status,
            progress: job.progress,
            message: job.message,
            error: job.error,
          },
    readyForTranscription: song.languageState === "CONFIRMED" && song.languageConfirmed,
  };
}

type ConfirmInput =
  | { languages: string[]; segments?: undefined }
  | { segments: Array<{ language: string; startTime: number; endTime: number }>; languages?: undefined };

function validateSegments(
  segments: Array<{ languageCode: string; startTime: number; endTime: number }>,
  durationSeconds: number,
): void {
  for (const seg of segments) {
    if (seg.startTime < 0 || seg.endTime <= seg.startTime) {
      throw new SongServiceError("VALIDATION", "Invalid segment times");
    }
    if (durationSeconds > 0 && seg.endTime > durationSeconds + 0.5) {
      throw new SongServiceError("VALIDATION", "Segment extends beyond song duration");
    }
  }
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (cur.startTime < prev.endTime - 0.01) {
      throw new SongServiceError("VALIDATION", "Overlapping language segments are not allowed");
    }
  }
}

export async function confirmSongLanguage(
  songId: string,
  userId: string,
  input: ConfirmInput,
): Promise<SongLanguageStatus> {
  await assertSongOwnedByUser(songId, userId);
  const song = await prisma.song.findUniqueOrThrow({ where: { id: songId } });

  const duration = song.durationSeconds ?? 0;
  const now = new Date();

  if ("languages" in input && input.languages?.length) {
    const codes = input.languages.map((l) => normalizeLanguageCode(l)).filter(Boolean);
    if (codes.length !== input.languages.length || !codes[0]) {
      throw new SongServiceError("VALIDATION", "Invalid language");
    }
    const primary = codes[0];

    await prisma.$transaction(async (tx) => {
      await tx.languageSegment.deleteMany({
        where: { songId, source: "ARTIST_CONFIRMED" },
      });
      if (duration > 0) {
        await tx.languageSegment.create({
          data: {
            songId,
            languageCode: primary,
            startTime: 0,
            endTime: duration,
            source: "ARTIST_CONFIRMED",
          },
        });
      }
      await tx.song.update({
        where: { id: songId },
        data: {
          primaryLanguageCode: primary,
          languageConfirmed: true,
          languageConfirmedAt: now,
          languageState: "CONFIRMED",
          status: "LANGUAGE_CONFIRMED",
        },
      });
    });
  } else if ("segments" in input && input.segments?.length) {
    const mapped = input.segments.map((s) => {
      const languageCode = normalizeLanguageCode(s.language);
      if (!languageCode) {
        throw new SongServiceError("VALIDATION", "Invalid language in segment");
      }
      return {
        languageCode,
        startTime: s.startTime,
        endTime: s.endTime,
      };
    });
    validateSegments(mapped, duration);
    const primary = mapped[0]!.languageCode;

    await prisma.$transaction(async (tx) => {
      await tx.languageSegment.deleteMany({
        where: { songId, source: "ARTIST_CONFIRMED" },
      });
      for (const seg of mapped) {
        await tx.languageSegment.create({
          data: {
            songId,
            languageCode: seg.languageCode,
            startTime: seg.startTime,
            endTime: seg.endTime,
            source: "ARTIST_CONFIRMED",
          },
        });
      }
      await tx.song.update({
        where: { id: songId },
        data: {
          primaryLanguageCode: primary,
          languageConfirmed: true,
          languageConfirmedAt: now,
          languageState: "CONFIRMED",
          status: "LANGUAGE_CONFIRMED",
        },
      });
    });
  } else {
    throw new SongServiceError("VALIDATION", "Provide languages or segments");
  }

  const { enqueueTranscriptionForSong } = await import("./transcriptionJobService.js");
  await enqueueTranscriptionForSong(songId);

  return getSongLanguageStatus(songId, userId);
}
