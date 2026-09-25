import type { Artist } from "../../features/artist/types";

export function ArtistAvatar({
  artist,
  size = "md",
}: {
  artist: Pick<Artist, "name" | "profileImageUrl">;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg" ? "h-28 w-28 text-xl" : size === "sm" ? "h-10 w-10 text-xs" : "h-20 w-20 text-sm";

  if (artist.profileImageUrl) {
    return (
      <img
        src={artist.profileImageUrl}
        alt=""
        className={`${dims} rounded-full border-2 border-zinc-950 object-cover shadow-lg`}
      />
    );
  }

  const initial = artist.name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`${dims} flex items-center justify-center rounded-full border-2 border-zinc-800 bg-violet-600/25 font-semibold text-violet-200`}
    >
      {initial}
    </div>
  );
}
