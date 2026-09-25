import type { UserRole } from "@prisma/client";

const rank: Record<UserRole, number> = {
  USER: 1,
  ARTIST: 2,
  ADMIN: 3,
};

/** Role hierarchy: ADMIN > ARTIST > USER */
export function roleAtLeast(
  userRole: UserRole,
  minimum: UserRole,
): boolean {
  return rank[userRole] >= rank[minimum];
}

export function canManagePlatform(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canPublishAsArtist(role: UserRole): boolean {
  return role === "ARTIST" || role === "ADMIN";
}
