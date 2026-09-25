import type { Artist, ArtistVerification, Prisma, VerificationStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

import type { ArtistCreateInput, ArtistUpdateInput } from "../lib/artistSocialLinks.js";

import { normalizeSocialLinks } from "../lib/artistSocialLinks.js";

import { slugify } from "../lib/slug.js";



export type ArtistVerificationView = {

  status: "PENDING" | "VERIFIED" | "REJECTED";

  rejectionNote: string | null;

};



export type ArtistPrivateView = {

  id: string;

  slug: string;

  name: string;

  biography: string | null;

  profileImageUrl: string | null;

  coverImageUrl: string | null;

  genre: string | null;

  location: string | null;

  website: string | null;

  socialLinks: Record<string, string> | null;

  isVerified: boolean;

  verification: ArtistVerificationView;

  createdAt: string;

  updatedAt: string;

};



export type ArtistPublicView = {

  id: string;

  slug: string;

  name: string;

  biography: string | null;

  profileImageUrl: string | null;

  coverImageUrl: string | null;

  genre: string | null;

  location: string | null;

  website: string | null;

  socialLinks: Record<string, string> | null;

  isVerified: boolean;

  stats: {

    songs: number;

    albums: number;

    lyrics: number;

    videos: number;

  };

};



export class ArtistServiceError extends Error {

  constructor(

    public code: "ARTIST_EXISTS" | "NOT_FOUND" | "FORBIDDEN",

    message: string,

  ) {

    super(message);

  }

}



export async function getArtistForUser(userId: string): Promise<Artist | null> {

  return prisma.artist.findUnique({ where: { ownerUserId: userId } });

}



function parseSocialLinks(value: Prisma.JsonValue | null): Record<string, string> | null {

  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(value)) {

    if (typeof v === "string" && v.trim()) out[k] = v;

  }

  return Object.keys(out).length ? out : null;

}



export function resolveVerificationStatus(

  artist: Pick<Artist, "isVerified">,

  latest: Pick<ArtistVerification, "status" | "evidence"> | null,

): ArtistVerificationView {

  if (artist.isVerified) {

    return { status: "VERIFIED", rejectionNote: null };

  }

  if (latest?.status === "REJECTED") {

    return {

      status: "REJECTED",

      rejectionNote: latest.evidence?.trim() || null,

    };

  }

  return { status: "PENDING", rejectionNote: null };

}



async function latestVerification(

  artistId: string,

): Promise<Pick<ArtistVerification, "status" | "evidence"> | null> {

  return prisma.artistVerification.findFirst({

    where: { artistId },

    orderBy: { createdAt: "desc" },

    select: { status: true, evidence: true },

  });

}



export async function toArtistPrivateView(artist: Artist): Promise<ArtistPrivateView> {

  const verification = resolveVerificationStatus(

    artist,

    await latestVerification(artist.id),

  );

  return {

    id: artist.id,

    slug: artist.slug,

    name: artist.name,

    biography: artist.biography,

    profileImageUrl: artist.profileImageUrl,

    coverImageUrl: artist.coverImageUrl,

    genre: artist.genre,

    location: artist.location,

    website: artist.website,

    socialLinks: parseSocialLinks(artist.socialLinks),

    isVerified: artist.isVerified,

    verification,

    createdAt: artist.createdAt.toISOString(),

    updatedAt: artist.updatedAt.toISOString(),

  };

}



async function uniqueSlug(base: string, excludeId?: string): Promise<string> {

  let slug = slugify(base);

  let n = 1;

  while (true) {

    const taken = await prisma.artist.findFirst({

      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },

    });

    if (!taken) return slug;

    slug = `${slugify(base)}-${n++}`;

  }

}



export async function createArtistProfile(

  userId: string,

  input: ArtistCreateInput,

): Promise<ArtistPrivateView> {

  const existing = await getArtistForUser(userId);

  if (existing) {

    throw new ArtistServiceError("ARTIST_EXISTS", "You already have an artist profile");

  }



  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const slug = await uniqueSlug(input.name);

  const socialLinks = normalizeSocialLinks(input.socialLinks);



  const artist = await prisma.$transaction(async (tx) => {

    if (user.role === "USER") {

      await tx.user.update({

        where: { id: userId },

        data: { role: "ARTIST" },

      });

    }



    const created = await tx.artist.create({

      data: {

        ownerUserId: userId,

        slug,

        name: input.name.trim(),

        biography: input.biography?.trim() || null,

        genre: input.genre?.trim() || null,

        location: input.location?.trim() || null,

        website: input.website?.trim() || null,

        profileImageUrl: input.profileImageUrl ?? null,

        coverImageUrl: input.coverImageUrl ?? null,

        socialLinks: socialLinks as Prisma.InputJsonValue | undefined,

        isVerified: false,

      },

    });



    await tx.artistVerification.create({

      data: {

        artistId: created.id,

        requestedByUserId: userId,

        status: "PENDING" satisfies VerificationStatus,

        evidence: "Artist profile created — awaiting platform verification.",

      },

    });



    return created;

  });



  return toArtistPrivateView(artist);

}



/** @deprecated Use createArtistProfile during onboarding. Kept for legacy upload paths. */

/** For clip-based lyric videos: any user gets a personal artist row (promotes USER → ARTIST). */
export async function ensureCreatorArtist(userId: string): Promise<Artist> {
  const existing = await getArtistForUser(userId);
  if (existing) return existing;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const display =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email.split("@")[0] ||
    "Creator";

  const view = await createArtistProfile(userId, {
    name: display,
    biography: "Personal lyric videos and clips on Nyimba.",
  });
  return prisma.artist.findUniqueOrThrow({ where: { id: view.id } });
}

export async function getOrCreateArtist(userId: string): Promise<Artist> {

  const existing = await getArtistForUser(userId);

  if (existing) return existing;

  throw new ArtistServiceError(

    "NOT_FOUND",

    "Create your artist profile at POST /api/v1/artists first",

  );

}



export async function updateArtistProfile(

  userId: string,

  input: ArtistUpdateInput,

): Promise<ArtistPrivateView> {

  const artist = await getArtistForUser(userId);

  if (!artist) {

    throw new ArtistServiceError("NOT_FOUND", "Artist profile not found");

  }



  const data: Prisma.ArtistUpdateInput = {};

  if (input.name !== undefined) {

    data.name = input.name.trim();

    if (input.name.trim()) {

      data.slug = await uniqueSlug(input.name, artist.id);

    }

  }

  if (input.biography !== undefined) data.biography = input.biography?.trim() || null;

  if (input.profileImageUrl !== undefined) data.profileImageUrl = input.profileImageUrl;

  if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl;

  if (input.genre !== undefined) data.genre = input.genre?.trim() || null;

  if (input.location !== undefined) data.location = input.location?.trim() || null;

  if (input.website !== undefined) data.website = input.website?.trim() || null;

  if (input.socialLinks !== undefined) {

    const normalized = normalizeSocialLinks(input.socialLinks);

    data.socialLinks = (normalized ?? null) as Prisma.InputJsonValue;

  }



  const updated = await prisma.artist.update({ where: { id: artist.id }, data });

  return toArtistPrivateView(updated);

}



export async function getPublicArtistById(id: string): Promise<ArtistPublicView | null> {

  const artist = await prisma.artist.findUnique({

    where: { id },

    include: {

      _count: { select: { songs: true, albums: true } },

    },

  });

  if (!artist) return null;



  const songIds = (

    await prisma.song.findMany({

      where: { artistId: artist.id, status: "PUBLISHED" },

      select: { id: true },

    })

  ).map((s) => s.id);



  const [lyrics, videos] = await Promise.all([

    prisma.lyrics.count({ where: { songId: { in: songIds } } }),

    prisma.videoProject.count({ where: { songId: { in: songIds } } }),

  ]);



  return {

    id: artist.id,

    slug: artist.slug,

    name: artist.name,

    biography: artist.biography,

    profileImageUrl: artist.profileImageUrl,

    coverImageUrl: artist.coverImageUrl,

    genre: artist.genre,

    location: artist.location,

    website: artist.website,

    socialLinks: parseSocialLinks(artist.socialLinks),

    isVerified: artist.isVerified,

    stats: {

      songs: songIds.length,

      albums: artist._count.albums,

      lyrics,

      videos,

    },

  };

}



export async function assertArtistOwner(artistId: string, userId: string): Promise<Artist> {

  const artist = await prisma.artist.findUnique({ where: { id: artistId } });

  if (!artist) throw new ArtistServiceError("NOT_FOUND", "Artist not found");

  if (artist.ownerUserId !== userId) {

    throw new ArtistServiceError("FORBIDDEN", "You cannot modify this artist profile");

  }

  return artist;

}



export async function getArtistDashboardStats(artistId: string) {

  const songIds = (

    await prisma.song.findMany({

      where: { artistId },

      select: { id: true },

    })

  ).map((s) => s.id);



  const [songs, albums, lyrics, videos, views] = await Promise.all([

    prisma.song.count({ where: { artistId } }),

    prisma.album.count({ where: { artistId } }),

    prisma.lyrics.count({ where: { songId: { in: songIds } } }),

    prisma.videoProject.count({ where: { songId: { in: songIds } } }),

    prisma.songView.count({ where: { songId: { in: songIds } } }),

  ]);



  return { songs, albums, lyrics, videos, views };

}


