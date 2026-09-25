import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { trackEvent } from "../services/analyticsService.js";
import { getActiveLyrics } from "../services/lyricsService.js";

export const publicCatalogRouter = Router();

publicCatalogRouter.get("/songs/:id", async (req, res) => {
  const song = await prisma.song.findFirst({
    where: {
      id: String(req.params.id),
      status: "PUBLISHED",
    },
    include: {
      artist: {
        select: {
          id: true,
          slug: true,
          name: true,
          profileImageUrl: true,
          isVerified: true,
        },
      },
      album: { select: { id: true, title: true } },
    },
  });

  if (!song) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }

  const lyrics = await getActiveLyrics(song.id);
  const verified = lyrics?.status === "ARTIST_VERIFIED";

  void trackEvent({
    eventType: "SONG_VIEW",
    songId: song.id,
    artistId: song.artistId,
    userId: undefined,
  });
  if (lyrics) {
    void trackEvent({
      eventType: "LYRICS_VIEW",
      songId: song.id,
      artistId: song.artistId,
    });
  }

  res.json({
    song,
    lyrics,
    verification: verified
      ? { label: "Official lyrics — verified by artist", verified: true }
      : { verified: false },
  });
});

publicCatalogRouter.post("/songs/:id/play", optionalAuthenticate, async (req, res) => {
  const song = await prisma.song.findFirst({
    where: { id: String(req.params.id), status: "PUBLISHED" },
    select: { id: true, artistId: true },
  });
  if (!song) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Song not found" } });
    return;
  }
  await trackEvent({
    eventType: "AUDIO_PLAY",
    songId: song.id,
    artistId: song.artistId,
    userId: req.auth?.id,
  });
  res.json({ ok: true });
});

publicCatalogRouter.get("/artists/:slug", async (req, res) => {
  const artist = await prisma.artist.findUnique({
    where: { slug: String(req.params.slug) },
    include: {
      albums: { orderBy: { releaseDate: "desc" }, take: 20 },
      songs: {
        where: { status: "PUBLISHED" },
        orderBy: { releaseDate: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          releaseDate: true,
          genre: true,
        },
      },
      _count: {
        select: {
          songs: true,
          albums: true,
        },
      },
    },
  });

  if (!artist) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Artist not found" } });
    return;
  }

  const videoCount = await prisma.videoProject.count({
    where: { song: { artistId: artist.id } },
  });

  res.json({
    artist: {
      id: artist.id,
      slug: artist.slug,
      name: artist.name,
      isVerified: artist.isVerified,
      biography: artist.biography,
      profileImageUrl: artist.profileImageUrl,
      coverImageUrl: artist.coverImageUrl,
      genre: artist.genre,
      location: artist.location,
      socialLinks: artist.socialLinks,
      stats: {
        songs: artist._count.songs,
        albums: artist._count.albums,
        videos: videoCount,
      },
      albums: artist.albums,
      songs: artist.songs,
    },
  });
});
