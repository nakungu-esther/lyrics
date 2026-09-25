import { Link } from "react-router-dom";
import type { Song } from "../../features/songs/types";
import { HubIcon } from "../icons/HubIcon";
import { SongStatusBadge } from "./SongStatusBadge";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export function SongCard({
  song,
  onDelete,
}: {
  song: Song;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex gap-3">
        {song.coverImageUrl ? (
          <img src={song.coverImageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-zinc-800" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium">{song.title}</h3>
            <SongStatusBadge status={song.status} />
          </div>
          <p className="text-xs text-zinc-500">{song.genre || "No genre"}</p>
          <p className="text-xs text-zinc-600">Created {formatDate(song.createdAt)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          to={`/artist/songs/${song.id}`}
          className="inline-flex items-center gap-1 text-violet-400 hover:underline"
        >
          <HubIcon name="eye" size={14} />
          View
        </Link>
        <Link
          to={`/artist/songs/${song.id}/edit`}
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
        >
          <HubIcon name="edit" size={14} />
          Edit
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-red-400 hover:underline"
          onClick={onDelete}
        >
          <HubIcon name="delete" size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}
