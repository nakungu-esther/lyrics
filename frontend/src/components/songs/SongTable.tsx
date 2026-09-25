import { Link } from "react-router-dom";
import type { Song } from "../../features/songs/types";
import { HubIcon } from "../icons/HubIcon";
import { SongStatusBadge } from "./SongStatusBadge";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export function SongTable({
  songs,
  onDelete,
}: {
  songs: Song[];
  onDelete: (song: Song) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">Song</th>
            <th className="px-4 py-3 font-medium">Genre</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Release</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {songs.map((song) => (
            <tr key={song.id} className="hover:bg-zinc-900/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {song.coverImageUrl ? (
                    <img src={song.coverImageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-zinc-800" />
                  )}
                  <span className="font-medium text-zinc-100">{song.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-400">{song.genre || "—"}</td>
              <td className="px-4 py-3">
                <SongStatusBadge status={song.status} />
              </td>
              <td className="px-4 py-3 text-zinc-400">{formatDate(song.releaseDate)}</td>
              <td className="px-4 py-3 text-zinc-500">{formatDate(song.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
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
                    onClick={() => onDelete(song)}
                  >
                    <HubIcon name="delete" size={14} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
