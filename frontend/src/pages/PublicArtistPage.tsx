import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchPublicArtist } from "../api/artists";
import { ArtistEmptyState } from "../components/artist/ArtistEmptyState";
import { ArtistProfileHeader } from "../components/artist/ArtistProfileHeader";
import { artistKeys } from "../features/artist/queryKeys";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function PublicArtistPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const artistId = id ?? slug ?? "";

  const { data: artist, isLoading, isError } = useQuery({
    queryKey: artistKeys.public(artistId),
    queryFn: () => fetchPublicArtist(artistId),
    enabled: UUID_RE.test(artistId),
  });

  if (!UUID_RE.test(artistId)) {
    return <p className="text-sm text-zinc-500">Artist not found.</p>;
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Loading artist…</p>;
  if (isError || !artist) {
    return <p className="text-sm text-red-400">Artist not found.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 md:px-0">
      <ArtistProfileHeader artist={artist} />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Songs</h2>
        <ArtistEmptyState
          title="No songs published yet"
          description="When this artist publishes tracks, they will appear here."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Albums</h2>
        <ArtistEmptyState
          title="No albums yet"
          description="Album releases will be listed on this page."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Lyrics</h2>
        <ArtistEmptyState
          title="No lyrics published yet"
          description="Synced lyrics will appear here after songs are published."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Videos</h2>
        <ArtistEmptyState
          title="No videos yet"
          description="Lyric videos and music videos will show here."
        />
      </section>
    </div>
  );
}
