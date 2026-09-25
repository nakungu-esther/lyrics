import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { SongPlayer } from "../components/player/SongPlayer";

type PublicSong = {
  song: {
    id: string;
    title: string;
    coverImageUrl: string | null;
    audioUrl: string | null;
    durationSeconds: number | null;
    artist: {
      id: string;
      slug: string;
      name: string;
      profileImageUrl: string | null;
      isVerified?: boolean;
    };
  };
  lyrics: {
    status: string;
    sections: {
      label: string | null;
      lines: { text: string }[];
    }[];
  } | null;
  verification: { label?: string; verified: boolean };
};

export function PublicSongPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["public", "song", id],
    queryFn: () => apiGet<PublicSong>(`/api/v1/public/songs/${id}`),
    enabled: Boolean(id),
  });

  if (isLoading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!data) return <p className="text-sm text-red-400">Song not found</p>;

  const { song, lyrics, verification } = data;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex gap-6">
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt=""
            className="h-32 w-32 rounded-xl object-cover border border-zinc-800"
          />
        ) : (
          <div className="h-32 w-32 rounded-xl bg-zinc-900 border border-zinc-800" />
        )}
        <div>
          <h1 className="text-3xl font-semibold">{song.title}</h1>
          <Link
            to={`/artists/${song.artist.slug}`}
            className="mt-2 inline-block text-violet-400 hover:underline"
          >
            {song.artist.name}
            {song.artist.isVerified && (
              <span className="ml-2 text-emerald-400 text-sm">✓ Verified artist</span>
            )}
          </Link>
          {verification.verified && (
            <p className="mt-3 text-sm text-emerald-400">{verification.label}</p>
          )}
        </div>
      </div>

      <SongPlayer
        audioUrl={song.audioUrl}
        durationSeconds={song.durationSeconds}
        onPlayStart={() => {
          if (id) void apiPost(`/api/v1/public/songs/${id}/play`);
        }}
      />

      <div>
        <h2 className="text-lg font-medium border-b border-zinc-800 pb-2">Lyrics</h2>
        <div className="mt-6 space-y-8">
          {lyrics?.sections.map((sec, i) => (
            <div key={i}>
              {sec.label && (
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">{sec.label}</p>
              )}
              {sec.lines.map((line, j) => (
                <p key={j} className="text-lg leading-relaxed text-zinc-100">
                  {line.text}
                </p>
              ))}
            </div>
          )) ?? <p className="text-zinc-500">No lyrics published yet.</p>}
        </div>
      </div>
    </div>
  );
}
