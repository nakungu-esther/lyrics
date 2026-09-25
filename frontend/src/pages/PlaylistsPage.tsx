import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

type Playlist = {
  id: string;
  title: string;
  songs: {
    song: {
      id: string;
      title: string;
      audioUrl: string | null;
      artist: { name: string };
    };
  }[];
};

export function PlaylistsPage() {
  const [title, setTitle] = useState("");
  const [songId, setSongId] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<string>("");
  const queryClient = useQueryClient();

  const playlists = useQuery({
    queryKey: ["playlists"],
    queryFn: () => apiGet<{ playlists: Playlist[] }>("/api/v1/playlists/me"),
  });

  const create = useMutation({
    mutationFn: () => apiPost("/api/v1/playlists", { title }),
    onSuccess: () => {
      setTitle("");
      void queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });

  const list = playlists.data?.playlists ?? [];
  const playList = list.find((p) => p.id === activePlaylist) ?? list[0];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">My playlists</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void create.mutateAsync();
        }}
        className="flex gap-2 max-w-md"
      >
        <Input
          placeholder="My Luganda Favorites"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Button type="submit">Create</Button>
      </form>

      <div className="space-y-6">
        {list.map((pl) => (
          <div key={pl.id} className="rounded-xl border border-zinc-800 p-4">
            <div className="flex justify-between items-center gap-2">
              <button type="button" className="font-medium text-left" onClick={() => setActivePlaylist(pl.id)}>
                {pl.title}
              </button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void apiDelete(`/api/v1/playlists/${pl.id}`).then(() =>
                    queryClient.invalidateQueries({ queryKey: ["playlists"] }),
                  )
                }
              >
                Delete
              </Button>
            </div>
            <ol className="mt-3 space-y-1 list-decimal list-inside text-sm text-zinc-300">
              {pl.songs.map((entry, i) => (
                <li key={entry.song.id} className="flex justify-between gap-2">
                  <span>
                    {i + 1}. {entry.song.title} — {entry.song.artist.name}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-zinc-500 hover:text-red-400"
                    onClick={() =>
                      void apiDelete(`/api/v1/playlists/${pl.id}/songs/${entry.song.id}`).then(() =>
                        queryClient.invalidateQueries({ queryKey: ["playlists"] }),
                      )
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {playList && playList.songs[0]?.song.audioUrl && (
        <div>
          <p className="text-sm text-zinc-500 mb-2">Play playlist (first track)</p>
          <audio controls className="w-full" src={playList.songs[0].song.audioUrl} />
        </div>
      )}

      {list.length > 0 && (
        <form
          className="flex flex-wrap gap-2 max-w-lg text-sm"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            const pid = activePlaylist || list[0]!.id;
            void apiPost(`/api/v1/playlists/${pid}/songs`, { songId }).then(() => {
              setSongId("");
              void queryClient.invalidateQueries({ queryKey: ["playlists"] });
            });
          }}
        >
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-2"
            value={activePlaylist || list[0]?.id}
            onChange={(e) => setActivePlaylist(e.target.value)}
          >
            {list.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <Input placeholder="Published song ID" value={songId} onChange={(e) => setSongId(e.target.value)} />
          <Button type="submit">Add song</Button>
        </form>
      )}
    </div>
  );
}
