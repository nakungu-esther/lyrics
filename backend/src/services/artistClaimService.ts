import { prisma } from "../lib/prisma.js";
import { notifyUser } from "./notificationService.js";

export async function searchArtistsByName(query: string, limit = 20) {
  const q = query.trim();
  if (!q) return [];
  return prisma.artist.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      profileImageUrl: true,
      isVerified: true,
      ownerUserId: true,
    },
  });
}

export async function requestArtistVerification(
  artistId: string,
  userId: string,
  evidence?: string,
) {
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) throw new Error("NOT_FOUND");
  if (artist.ownerUserId !== userId) throw new Error("FORBIDDEN");

  const existing = await prisma.artistVerification.findFirst({
    where: { artistId, status: "PENDING" },
  });
  if (existing) return existing;

  const req = await prisma.artistVerification.create({
    data: {
      artistId,
      requestedByUserId: userId,
      evidence: evidence?.trim(),
      status: "PENDING",
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      notifyUser(
        a.id,
        "Artist verification request",
        `${artist.name} requested verified artist status.`,
        { artistId, verificationId: req.id },
      ),
    ),
  );

  return req;
}

export async function reviewArtistVerification(
  verificationId: string,
  adminUserId: string,
  approve: boolean,
) {
  const req = await prisma.artistVerification.findUniqueOrThrow({
    where: { id: verificationId },
    include: { artist: true },
  });

  const status = approve ? "VERIFIED" : "REJECTED";

  await prisma.$transaction([
    prisma.artistVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
    }),
    ...(approve
      ? [
          prisma.artist.update({
            where: { id: req.artistId },
            data: { isVerified: true },
          }),
        ]
      : []),
  ]);

  await notifyUser(
    req.requestedByUserId,
    approve ? "Artist account verified ✓" : "Verification request declined",
    approve
      ? `Your artist profile "${req.artist.name}" is now verified.`
      : `Your verification request for "${req.artist.name}" was not approved.`,
    { artistId: req.artistId, approved: approve },
  );

  return req;
}
