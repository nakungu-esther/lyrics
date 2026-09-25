import type { Artist, ArtistPublic } from "../../features/artist/types";
import { ArtistAvatar } from "./ArtistAvatar";
import { ArtistSocialLinks } from "./ArtistSocialLinks";
import { VerificationBadge } from "./VerificationBadge";

export function ArtistProfileHeader({
  artist,
}: {
  artist: Artist | ArtistPublic;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <div className="relative h-44 md:h-52">
        {artist.coverImageUrl ? (
          <img src={artist.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-950/80 via-zinc-900 to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>
      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <ArtistAvatar artist={artist} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {artist.name}
              </h1>
              <VerificationBadge
                isVerified={artist.isVerified}
                status={artist.verification?.status}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              {artist.genre && <span>{artist.genre}</span>}
              {artist.location && <span>{artist.location}</span>}
            </div>
          </div>
        </div>
        {artist.biography && (
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
            {artist.biography}
          </p>
        )}
        <div className="mt-4">
          <ArtistSocialLinks website={artist.website} socialLinks={artist.socialLinks} />
        </div>
      </div>
    </div>
  );
}
