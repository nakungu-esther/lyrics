import type { LyricSectionType, LyricsStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { notifyUser } from "./notificationService.js";
import type { TranscriptionSegment } from "../ai/types.js";

function sectionTypeFromLabel(label: string): LyricSectionType {
  const u = label.toUpperCase();
  if (u.includes("CHORUS")) return "CHORUS";
  if (u.includes("VERSE")) return "VERSE";
  if (u.includes("BRIDGE")) return "BRIDGE";
  if (u.includes("INTRO")) return "INTRO";
  if (u.includes("OUTRO")) return "OUTRO";
  return "OTHER";
}

export async function getActiveLyrics(songId: string) {
  return prisma.lyrics.findFirst({
    where: { songId, isActive: true },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          lines: {
            orderBy: { sortOrder: "asc" },
            include: { words: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
}

export async function createLyricsFromTranscription(
  songId: string,
  languageCode: string,
  segments: TranscriptionSegment[],
): Promise<{ lyricsId: string }> {
  const existing = await prisma.lyrics.findFirst({
    where: { songId, isActive: true },
  });
  if (existing) {
    return { lyricsId: existing.id };
  }

  const version =
    (await prisma.lyrics.count({ where: { songId } })) + 1;

  const lyrics = await prisma.lyrics.create({
    data: {
      songId,
      version,
      status: "AI_GENERATED",
      isActive: true,
    },
  });

  let sectionOrder = 0;
  let currentSectionLabel = "VERSE 1";
  let lineOrderInSection = 0;
  let sectionId: string | null = null;

  const ensureSection = async (label: string) => {
    if (!sectionId || label !== currentSectionLabel) {
      currentSectionLabel = label;
      lineOrderInSection = 0;
      const section = await prisma.lyricSection.create({
        data: {
          lyricsId: lyrics.id,
          sortOrder: sectionOrder++,
          sectionType: sectionTypeFromLabel(label),
          label,
          languageCode,
        },
      });
      sectionId = section.id;
    }
  };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const label =
      i === 0
        ? "VERSE 1"
        : i === Math.floor(segments.length / 2)
          ? "CHORUS"
          : currentSectionLabel;
    await ensureSection(label);

    const line = await prisma.lyricLine.create({
      data: {
        sectionId: sectionId!,
        sortOrder: lineOrderInSection++,
        text: seg.text,
        startTime: seg.startTime,
        endTime: seg.endTime,
        languageCode,
      },
    });

    for (let wi = 0; wi < seg.words.length; wi++) {
      const w = seg.words[wi]!;
      await prisma.lyricWord.create({
        data: {
          lineId: line.id,
          sortOrder: wi,
          text: w.text,
          startTime: w.startTime,
          endTime: w.endTime,
          confidence: w.confidence,
          languageCode,
        },
      });
    }
  }

  return { lyricsId: lyrics.id };
}

export type LyricsEditorPayload = {
  sections: {
    id?: string;
    label?: string;
    sectionType?: LyricSectionType;
    sortOrder: number;
    lines: {
      id?: string;
      text: string;
      sortOrder: number;
      startTime?: number | null;
      endTime?: number | null;
      words?: {
        id?: string;
        text: string;
        sortOrder: number;
        startTime: number;
        endTime: number;
      }[];
    }[];
  }[];
};

export async function saveLyricsDraft(
  lyricsId: string,
  artistUserId: string,
  payload: LyricsEditorPayload,
  markEdited: boolean,
) {
  const lyrics = await prisma.lyrics.findUniqueOrThrow({
    where: { id: lyricsId },
    include: { song: { include: { artist: true } } },
  });

  if (lyrics.song.artist.ownerUserId !== artistUserId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.$transaction(async (tx) => {
    await tx.lyricWord.deleteMany({
      where: { line: { section: { lyricsId } } },
    });
    await tx.lyricLine.deleteMany({
      where: { section: { lyricsId } },
    });
    await tx.lyricSection.deleteMany({ where: { lyricsId } });

    for (const sec of payload.sections) {
      const section = await tx.lyricSection.create({
        data: {
          lyricsId,
          sortOrder: sec.sortOrder,
          sectionType: sec.sectionType ?? "OTHER",
          label: sec.label,
          languageCode: lyrics.song.primaryLanguageCode,
        },
      });

      for (const ln of sec.lines) {
        const line = await tx.lyricLine.create({
          data: {
            sectionId: section.id,
            sortOrder: ln.sortOrder,
            text: ln.text,
            startTime: ln.startTime ?? undefined,
            endTime: ln.endTime ?? undefined,
            languageCode: lyrics.song.primaryLanguageCode,
          },
        });

        if (ln.words?.length) {
          await tx.lyricWord.createMany({
            data: ln.words.map((w) => ({
              lineId: line.id,
              sortOrder: w.sortOrder,
              text: w.text,
              startTime: w.startTime,
              endTime: w.endTime,
              languageCode: lyrics.song.primaryLanguageCode,
            })),
          });
        }
      }
    }

    const data: Prisma.LyricsUpdateInput = {};
    if (markEdited && lyrics.status === "AI_GENERATED") {
      data.status = "ARTIST_EDITED";
    }
    if (Object.keys(data).length) {
      await tx.lyrics.update({ where: { id: lyricsId }, data });
    }
  });

  return getActiveLyrics(lyrics.songId);
}

export async function approveLyrics(
  lyricsId: string,
  artistUserId: string,
) {
  const lyrics = await prisma.lyrics.findUniqueOrThrow({
    where: { id: lyricsId },
    include: { song: { include: { artist: true } } },
  });

  if (lyrics.song.artist.ownerUserId !== artistUserId) {
    throw new Error("FORBIDDEN");
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.lyrics.update({
      where: { id: lyricsId },
      data: {
        status: "ARTIST_VERIFIED",
        verifiedAt: now,
        verifiedByUserId: artistUserId,
        approvedAt: now,
      },
    }),
    prisma.song.update({
      where: { id: lyrics.songId },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    }),
  ]);

  await notifyUser(
    artistUserId,
    "Your lyrics have been verified",
    `"${lyrics.song.title}" is published with official verified lyrics.`,
    { songId: lyrics.songId, lyricsId },
  );

  return getActiveLyrics(lyrics.songId);
}
