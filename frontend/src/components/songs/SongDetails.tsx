import { Link } from "react-router-dom";
import type { Song } from "../../features/songs/types";
import { Button } from "../ui/Button";
import { SongStatusBadge } from "./SongStatusBadge";
import { AudioProcessingPanel } from "./AudioProcessingPanel";
import { SongLanguageSection } from "./SongLanguageSection";
import { formatGenreLabel } from "../../lib/genreCatalog";

function mediaStatus(
  url: string | null | undefined,
  slot?: { uploaded: boolean },
): string {
  if (slot?.uploaded) return "Uploaded to storage";
  return url?.trim() ? "Available" : "Not uploaded yet";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SongDetails({ song }: { song: Song }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {song.coverImageUrl ? (
          <img
            src={song.coverImageUrl}
            alt=""
            className="h-40 w-40 rounded-xl object-cover border border-zinc-800"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 text-sm text-zinc-500">
            No cover
          </div>
        )}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{song.title}</h1>
            <SongStatusBadge status={song.status} />
          </div>
          {song.description && <p className="text-zinc-300">{song.description}</p>}
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Genre</dt>
              <dd>{formatGenreLabel(song.genre, song.subgenre ?? null)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Release date</dt>
              <dd>{formatDate(song.releaseDate)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Artist</dt>
              <dd>{song.artist?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Album</dt>
              <dd>{song.album?.title ?? "Single"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Audio</dt>
              <dd>{mediaStatus(song.audioUrl, song.media?.audio)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Music video</dt>
              <dd>{mediaStatus(song.musicVideoUrl, song.media?.musicVideo)}</dd>
            </div>
          </dl>
          <Link to={`/artist/songs/${song.id}/edit`}>
            <Button type="button" variant="ghost">
              Edit song
            </Button>
          </Link>
        </div>
      </div>

      <SongLanguageSection song={song} />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h3 className="text-sm font-medium text-zinc-200">Audio pipeline</h3>
        <div className="mt-3">
          <AudioProcessingPanel songId={song.id} audio={song.media?.audio} />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
        <h3 className="text-sm font-medium text-zinc-200">Lyrics workflow</h3>
        <p className="text-sm text-zinc-500">
          Platform path: process audio → confirm language → AI transcription → edit &amp; sync.
          Or use the classic tool for tap sync, vocal isolation, and timeline editing on any file.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to={`/artist/songs/${song.id}/language`}>
            <Button type="button" variant="ghost">
              Language
            </Button>
          </Link>
          <Link to={`/artist/songs/${song.id}/lyrics`}>
            <Button type="button" variant="ghost">
              Lyrics editor
            </Button>
          </Link>
          <Link to="/lrc-studio">
            <Button type="button" variant="ghost">
              LRC Studio
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
