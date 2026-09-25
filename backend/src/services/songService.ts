import type { Album, Artist, Song, SongStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { CreateSongInput, UpdateSongInput } from "../lib/songValidation.js";
import { uniqueSongSlug } from "../lib/slug.js";
import { getArtistForUser } from "./artistService.js";
import { serializeSongMedia } from "./uploadService.js";

export class SongServiceError extends Error {
  constructor(
    public code: "NOT_FOUND" | "FORBIDDEN" | "VALIDATION",
    message: string,
  ) {
    super(message);
  }
}

export type SongListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  subgenre: string | null;
  status: SongStatus;
  releaseDate: string | null;
  coverImageUrl: string | null;
  audioUrl: string | null;
  musicVideoUrl: string | null;
  durationSeconds: number | null;
  detectedLanguageCode: string | null;
  languageConfidence: number | null;
  languageConfirmed: boolean;
  languageState: string;
  primaryLanguageCode: string | null;
  album: { id: string; title: string } | null;
  media: ReturnType<typeof serializeSongMedia>;
  createdAt: string;
  updatedAt: string;
};

export type SongDetail = SongListItem & {
  artist: { id: string; name: string; slug: string };
};

function toSongListItem(
  song: Song & { album: Pick<Album, "id" | "title"> | null },
): SongListItem {
  return {
    id: song.id,
    title: song.title,
    slug: song.slug,
    description: song.description,
    genre: song.genre,
    subgenre: song.subgenre,
    status: song.status,
    releaseDate: song.releaseDate?.toISOString() ?? null,
    coverImageUrl: song.coverImageUrl,
    audioUrl: song.audioUrl,
    musicVideoUrl: song.backgroundVideoUrl,
    durationSeconds: song.durationSeconds,
    detectedLanguageCode: song.detectedLanguageCode,
    languageConfidence: song.languageConfidence,
    languageConfirmed: song.languageConfirmed,
    languageState: song.languageState,
    primaryLanguageCode: song.primaryLanguageCode,
    album: song.album,
    media: serializeSongMedia(song),
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
  };
}

export async function getOwnedArtist(userId: string): Promise<Artist> {
  const artist = await getArtistForUser(userId);
  if (!artist) {
    throw new SongServiceError("FORBIDDEN", "Artist profile required");
  }
  return artist;
}

export async function assertSongOwnedByUser(
  songId: string,
  userId: string,
): Promise<Song & { album: Album | null; artist: Artist }> {
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { album: true, artist: true },
  });
  if (!song) {
    throw new SongServiceError("NOT_FOUND", "Song not found");
  }
  if (song.artist.ownerUserId !== userId) {
    throw new SongServiceError("FORBIDDEN", "You cannot access this song");
  }
  return song;
}

async function assertAlbumForArtist(albumId: string, artistId: string): Promise<void> {
  const album = await prisma.album.findFirst({
    where: { id: albumId, artistId },
  });
  if (!album) {
    throw new SongServiceError("VALIDATION", "Album not found for this artist");
  }
}

export async function listSongsForArtistUser(userId: string): Promise<SongListItem[]> {
  const artist = await getOwnedArtist(userId);
  const songs = await prisma.song.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    include: { album: { select: { id: true, title: true } } },
  });
  return songs.map(toSongListItem);
}

export async function createSongDraft(
  userId: string,
  input: CreateSongInput,
): Promise<SongDetail> {
  const artist = await getOwnedArtist(userId);

  if (input.albumId) {
    await assertAlbumForArtist(input.albumId, artist.id);
  }

  const slug = await uniqueSongSlug(artist.id, input.title, async (s) =>
    Boolean(await prisma.song.findFirst({ where: { artistId: artist.id, slug: s } })),
  );

  const song = await prisma.$transaction(async (tx) => {
    const created = await tx.song.create({
      data: {
        artistId: artist.id,
        albumId: input.albumId ?? null,
        title: input.title.trim(),
        slug,
        description: input.description?.trim() || null,
        genre: input.genre?.trim() || null,
        subgenre:
          input.genre?.trim().toLowerCase() === "gospel"
            ? input.subgenre?.trim() || null
            : null,
        releaseDate: input.releaseDate?.trim()
          ? new Date(input.releaseDate)
          : null,
        status: "DRAFT",
      },
      include: {
        album: { select: { id: true, title: true } },
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    await tx.songArtist.create({
      data: {
        songId: created.id,
        artistId: artist.id,
        role: "primary",
      },
    });

    return created;
  });

  return {
    ...toSongListItem(song),
    artist: song.artist,
  };
}

export async function getSongForUser(
  songId: string,
  userId: string,
): Promise<SongDetail> {
  const song = await assertSongOwnedByUser(songId, userId);
  return {
    ...toSongListItem(song),
    artist: { id: song.artist.id, name: song.artist.name, slug: song.artist.slug },
  };
}

export async function getPublicSong(songId: string): Promise<SongDetail | null> {
  const song = await prisma.song.findFirst({
    where: { id: songId, status: "PUBLISHED" },
    include: {
      album: { select: { id: true, title: true } },
      artist: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!song) return null;
  return {
    ...toSongListItem(song),
    artist: song.artist,
  };
}

export async function getSongForOptionalOwner(
  songId: string,
  userId: string | undefined,
): Promise<SongDetail | null> {
  if (userId) {
    try {
      return await getSongForUser(songId, userId);
    } catch (err) {
      if (err instanceof SongServiceError && err.code === "FORBIDDEN") {
        return getPublicSong(songId);
      }
      if (err instanceof SongServiceError && err.code === "NOT_FOUND") {
        return null;
      }
      throw err;
    }
  }
  return getPublicSong(songId);
}

export async function updateSongForUser(
  songId: string,
  userId: string,
  input: UpdateSongInput,
): Promise<SongDetail> {
  await assertSongOwnedByUser(songId, userId);
  const artist = await getOwnedArtist(userId);

  if (input.albumId) {
    await assertAlbumForArtist(input.albumId, artist.id);
  }

  const data: Parameters<typeof prisma.song.update>[0]["data"] = {};
  if (input.title !== undefined) {
    data.title = input.title.trim();
    if (input.title.trim()) {
      data.slug = await uniqueSongSlug(artist.id, input.title, async (s) =>
        Boolean(
          await prisma.song.findFirst({
            where: { artistId: artist.id, slug: s, NOT: { id: songId } },
          }),
        ),
      );
    }
  }
  if (input.description !== undefined) {
    data.description = input.description?.trim() || null;
  }
  if (input.genre !== undefined) {
    data.genre = input.genre?.trim() || null;
    if (input.genre?.trim().toLowerCase() !== "gospel") {
      data.subgenre = null;
    }
  }
  if (input.subgenre !== undefined) {
    data.subgenre = input.subgenre?.trim() || null;
  }
  if (input.releaseDate !== undefined) {
    data.releaseDate = input.releaseDate?.trim()
      ? new Date(input.releaseDate)
      : null;
  }
  if (input.albumId !== undefined) data.albumId = input.albumId;

  const song = await prisma.song.update({
    where: { id: songId },
    data,
    include: {
      album: { select: { id: true, title: true } },
      artist: { select: { id: true, name: true, slug: true } },
    },
  });

  return {
    ...toSongListItem(song),
    artist: song.artist,
  };
}

export async function deleteSongForUser(songId: string, userId: string): Promise<void> {
  await assertSongOwnedByUser(songId, userId);
  await prisma.song.delete({ where: { id: songId } });
}

export async function listAlbumsForArtistUser(userId: string) {
  const artist = await getOwnedArtist(userId);
  return prisma.album.findMany({
    where: { artistId: artist.id },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
}
