import type { AnalyticsEventType, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.js";

export async function trackEvent(input: {
  eventType: AnalyticsEventType;
  songId?: string;
  artistId?: string;
  userId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  let artistId = input.artistId;
  if (!artistId && input.songId) {
    const song = await prisma.song.findUnique({
      where: { id: input.songId },
      select: { artistId: true },
    });
    artistId = song?.artistId;
  }

  await prisma.analyticsEvent.create({
    data: {
      id: uuidv4(),
      eventType: input.eventType,
      songId: input.songId,
      artistId,
      userId: input.userId,
      meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  if (input.eventType === "SONG_VIEW" && input.songId) {
    await prisma.songView.create({
      data: { id: uuidv4(), songId: input.songId },
    });
  }
}

export async function getArtistAnalytics(artistId: string) {
  const songIds = (
    await prisma.song.findMany({
      where: { artistId },
      select: { id: true, title: true },
    })
  ).map((s) => s.id);

  const counts = await prisma.analyticsEvent.groupBy({
    by: ["eventType"],
    where: { artistId },
    _count: { _all: true },
  });

  const byType = Object.fromEntries(
    counts.map((c) => [c.eventType, c._count._all]),
  ) as Record<string, number>;

  const popularRaw = await prisma.analyticsEvent.groupBy({
    by: ["songId"],
    where: { artistId, songId: { in: songIds }, eventType: "SONG_VIEW" },
    _count: { _all: true },
  });
  const popular = popularRaw
    .filter((p) => p.songId)
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);

  const titles = await prisma.song.findMany({
    where: { id: { in: popular.map((p) => p.songId!).filter(Boolean) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(titles.map((t) => [t.id, t.title]));

  return {
    totals: {
      songViews: byType.SONG_VIEW ?? 0,
      audioPlays: byType.AUDIO_PLAY ?? 0,
      lyricsViews: byType.LYRICS_VIEW ?? 0,
      videoViews: byType.VIDEO_VIEW ?? 0,
      downloads: byType.DOWNLOAD ?? 0,
    },
    popularSongs: popular
      .filter((p) => p.songId)
      .map((p) => ({
        songId: p.songId!,
        title: titleMap.get(p.songId!) ?? "Song",
        views: p._count._all,
      })),
    periods: {
      daily: null,
      weekly: null,
      monthly: null,
    },
  };
}
