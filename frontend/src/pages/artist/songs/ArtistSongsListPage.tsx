import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../api/client";
import { DeleteSongDialog } from "../../../components/songs/DeleteSongDialog";
import { EmptySongsState } from "../../../components/songs/EmptySongsState";
import { SongCard } from "../../../components/songs/SongCard";
import { SongTable } from "../../../components/songs/SongTable";
import { Button } from "../../../components/ui/Button";
import { useArtistSongs, useDeleteSong } from "../../../features/songs/hooks";
import type { Song } from "../../../features/songs/types";

export function ArtistSongsListPage() {
  const { data: songs = [], isLoading, isError } = useArtistSongs();
  const deleteSong = useDeleteSong();
  const [pendingDelete, setPendingDelete] = useState<Song | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function requestDelete(song: Song) {
    setDeleteError(null);
    setPendingDelete(song);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteSong.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">My Songs</h1>
        <Link to="/artist/songs/new">
          <Button type="button">+ Add Song</Button>
        </Link>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading songs…</p>}
      {isError && <p className="text-sm text-red-400">Could not load songs.</p>}
      {deleteError && (
        <p className="text-sm text-red-400" role="alert">
          {deleteError}
        </p>
      )}

      {!isLoading && songs.length === 0 && <EmptySongsState />}

      {songs.length > 0 && (
        <>
          <div className="hidden md:block">
            <SongTable songs={songs} onDelete={requestDelete} />
          </div>
          <div className="grid gap-4 md:hidden">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} onDelete={() => requestDelete(song)} />
            ))}
          </div>
        </>
      )}

      <DeleteSongDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.title ?? ""}
        pending={deleteSong.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
