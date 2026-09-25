import { prisma } from "../lib/prisma.js";

export async function listPlaylists(ownerUserId: string) {
  return prisma.playlist.findMany({
    where: { ownerUserId },
    orderBy: { updatedAt: "desc" },
    include: {
      songs: {
        orderBy: { sortOrder: "asc" },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              coverImageUrl: true,
              audioUrl: true,
              artist: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function createPlaylist(ownerUserId: string, title: string) {
  return prisma.playlist.create({
    data: { ownerUserId, title: title.trim() },
  });
}

export async function deletePlaylist(ownerUserId: string, playlistId: string) {
  return prisma.playlist.deleteMany({
    where: { id: playlistId, ownerUserId },
  });
}

export async function addSongToPlaylist(
  ownerUserId: string,
  playlistId: string,
  songId: string,
) {
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, ownerUserId },
  });
  if (!playlist) throw new Error("NOT_FOUND");

  const song = await prisma.song.findFirst({
    where: { id: songId, status: "PUBLISHED" },
  });
  if (!song) throw new Error("SONG_NOT_PUBLISHED");

  const maxOrder = await prisma.playlistSong.aggregate({
    where: { playlistId },
    _max: { sortOrder: true },
  });

  await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId, songId } },
    create: {
      playlistId,
      songId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
    update: {},
  });

  return listPlaylists(ownerUserId);
}

export async function removeSongFromPlaylist(
  ownerUserId: string,
  playlistId: string,
  songId: string,
) {
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, ownerUserId },
  });
  if (!playlist) throw new Error("NOT_FOUND");

  await prisma.playlistSong.deleteMany({
    where: { playlistId, songId },
  });

  return listPlaylists(ownerUserId);
}
