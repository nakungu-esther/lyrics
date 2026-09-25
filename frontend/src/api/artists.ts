import { apiGet, apiPatch, apiPost } from "./client";
import type {
  Artist,
  ArtistDashboardResponse,
  ArtistMeResponse,
  ArtistPublic,
  ArtistSocialLinks,
} from "../features/artist/types";

function unwrapMe(body: ArtistMeResponse): Artist | null {
  return body.data?.artist ?? body.artist ?? null;
}

function unwrapDashboard(body: ArtistDashboardResponse) {
  if (body.data) return body.data;
  return { stats: body.stats!, artist: body.artist ?? null };
}

export type CreateArtistInput = {
  name: string;
  biography?: string;
  genre?: string;
  location?: string;
  website?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  socialLinks?: ArtistSocialLinks;
};

export async function fetchMyArtist(): Promise<Artist | null> {
  const body = await apiGet<ArtistMeResponse>("/api/v1/artists/me");
  return unwrapMe(body);
}

export async function createArtist(input: CreateArtistInput): Promise<Artist> {
  const body = await apiPost<{ data?: { artist: Artist }; artist?: Artist }>(
    "/api/v1/artists",
    input,
  );
  const artist = body.data?.artist ?? body.artist;
  if (!artist) throw new Error("Invalid create artist response");
  return artist;
}

export async function updateMyArtist(
  input: Partial<CreateArtistInput>,
): Promise<Artist> {
  const body = await apiPatch<{ data?: { artist: Artist }; artist?: Artist }>(
    "/api/v1/artists/me",
    input,
  );
  const artist = body.data?.artist ?? body.artist;
  if (!artist) throw new Error("Invalid update artist response");
  return artist;
}

export async function fetchPublicArtist(id: string): Promise<ArtistPublic> {
  const body = await apiGet<{ data?: { artist: ArtistPublic }; artist?: ArtistPublic }>(
    `/api/v1/artists/${id}`,
  );
  const artist = body.data?.artist ?? body.artist;
  if (!artist) throw new Error("Artist not found");
  return artist;
}

export async function fetchArtistDashboard() {
  const body = await apiGet<ArtistDashboardResponse>("/api/v1/artists/me/dashboard");
  return unwrapDashboard(body);
}
