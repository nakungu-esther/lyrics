import { prisma } from "../lib/prisma.js";

/** Delete test users and owned data (respects Artist → User RESTRICT FK). */
export async function deleteTestUsersByEmail(emails: string[]): Promise<void> {
  if (emails.length === 0) return;

  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  if (userIds.length === 0) return;

  const artists = await prisma.artist.findMany({
    where: { ownerUserId: { in: userIds } },
    select: { id: true },
  });
  const artistIds = artists.map((a) => a.id);

  if (artistIds.length > 0) {
    await prisma.song.deleteMany({ where: { artistId: { in: artistIds } } });
    await prisma.artist.deleteMany({ where: { id: { in: artistIds } } });
  }

  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
