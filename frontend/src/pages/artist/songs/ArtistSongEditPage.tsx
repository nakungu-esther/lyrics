import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../api/client";
import { LoadingScreen } from "../../../components/auth/LoadingScreen";
import {
  AudioUploader,
  ImageUploader,
  VideoUploader,
} from "../../../components/songs/MediaUploader";
import { SongForm, type SongFormValues } from "../../../components/songs/SongForm";
import { SongStatusBadge } from "../../../components/songs/SongStatusBadge";
import { Button } from "../../../components/ui/Button";
import { songKeys } from "../../../features/songs/queryKeys";
import { useArtistAlbums, useSong, useUpdateSong } from "../../../features/songs/hooks";

export function ArtistSongEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const songQuery = useSong(id);
  const albumsQuery = useArtistAlbums();
  const queryClient = useQueryClient();
  const update = useUpdateSong(id ?? "");
  const [values, setValues] = useState<SongFormValues>({
    title: "",
    description: "",
    genre: "",
    subgenre: "",
    releaseDate: "",
    albumId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const song = songQuery.data;
    if (!song) return;
    setValues({
      title: song.title,
      description: song.description ?? "",
      genre: song.genre ?? "",
      subgenre: song.subgenre ?? "",
      releaseDate: song.releaseDate ? song.releaseDate.slice(0, 10) : "",
      albumId: song.album?.id ?? "",
    });
  }, [songQuery.data]);

  if (songQuery.isLoading) return <LoadingScreen />;
  if (!songQuery.data) {
    return <p className="text-sm text-red-400">Song not found.</p>;
  }

  const song = songQuery.data;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    update.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        genre: values.genre.trim() || undefined,
        subgenre:
          values.genre === "Gospel" && values.subgenre.trim()
            ? values.subgenre.trim()
            : undefined,
        releaseDate: values.releaseDate || undefined,
        albumId: values.albumId || null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          navigate(`/artist/songs/${id}`);
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : "Could not save song"),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Edit song</h1>
          <SongStatusBadge status={song.status} />
        </div>
        <Link to={`/artist/songs/${id}`} className="text-sm text-violet-400 hover:underline">
          Cancel
        </Link>
      </div>
      <SongForm
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        onSubmit={onSubmit}
        albums={albumsQuery.data ?? []}
      >
        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-emerald-400">Saved.</p>}
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save changes"}
        </Button>
      </SongForm>

      <section className="space-y-4 border-t border-zinc-800 pt-8">
        <h2 className="text-sm font-medium text-zinc-300">Replace media</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <ImageUploader
            songId={id}
            uploaded={song.media?.cover?.uploaded}
            onComplete={() => void queryClient.invalidateQueries({ queryKey: songKeys.detail(id!) })}
          />
          <AudioUploader
            songId={id}
            uploaded={song.media?.audio?.uploaded}
            onComplete={() => void queryClient.invalidateQueries({ queryKey: songKeys.detail(id!) })}
          />
          <VideoUploader
            songId={id}
            uploaded={song.media?.musicVideo?.uploaded}
            onComplete={() => void queryClient.invalidateQueries({ queryKey: songKeys.detail(id!) })}
          />
        </div>
      </section>
    </div>
  );
}
