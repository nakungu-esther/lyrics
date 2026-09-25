import { FormEvent, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "../../../api/client";

import {

  AudioUploader,

  ImageUploader,

  VideoUploader,

} from "../../../components/songs/MediaUploader";

import { AudioProcessingPanel } from "../../../components/songs/AudioProcessingPanel";

import { SongForm, type SongFormValues } from "../../../components/songs/SongForm";

import { Button } from "../../../components/ui/Button";

import { fetchSong } from "../../../api/songs";
import { songKeys } from "../../../features/songs/queryKeys";

import { useArtistAlbums, useCreateSong } from "../../../features/songs/hooks";

import type { Song } from "../../../features/songs/types";



export function ArtistSongNewPage() {

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const albumsQuery = useArtistAlbums();

  const create = useCreateSong();

  const [draft, setDraft] = useState<Song | null>(null);

  const [values, setValues] = useState<SongFormValues>({

    title: "",

    description: "",

    genre: "",
    subgenre: "",

    releaseDate: "",

    albumId: "",

  });

  const [error, setError] = useState<string | null>(null);



  function onCreateDraft(e: FormEvent) {

    e.preventDefault();

    setError(null);

    if (!values.title.trim()) {

      setError("Title is required.");

      return;

    }

    create.mutate(

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

        onSuccess: (song) => setDraft(song),

        onError: (err) =>

          setError(err instanceof ApiError ? err.message : "Could not create song"),

      },

    );

  }



  async function afterUpload() {
    if (!draft) return;
    void queryClient.invalidateQueries({ queryKey: songKeys.detail(draft.id) });
    void queryClient.invalidateQueries({ queryKey: songKeys.list });
    const fresh = await fetchSong(draft.id);
    setDraft(fresh);
  }



  const songId = draft?.id;

  const media = draft?.media;



  return (

    <div className="space-y-8">

      <div className="flex items-center justify-between gap-3">

        <h1 className="text-xl font-semibold">Add song</h1>

        <Link to="/artist/songs" className="text-sm text-violet-400 hover:underline">

          Back to songs

        </Link>

      </div>



      <section className="space-y-4">

        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">

          Step 1 — Song information

        </h2>

        <SongForm

          values={values}

          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}

          onSubmit={onCreateDraft}

          albums={albumsQuery.data ?? []}

        >

          {error && (

            <p className="text-sm text-red-400" role="alert">

              {error}

            </p>

          )}

          <Button type="submit" disabled={create.isPending || Boolean(draft)}>

            {draft ? "Draft created" : create.isPending ? "Creating…" : "Create draft song"}

          </Button>

        </SongForm>

      </section>



      {draft && (

        <section className="space-y-4">

          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">

            Step 2 — Upload media

          </h2>

          <p className="text-sm text-zinc-400">

            Files upload directly to object storage. After audio upload, a background worker
            normalizes audio for the AI pipeline (FFmpeg).

          </p>

          <div className="grid gap-4 lg:grid-cols-3">

            <ImageUploader

              songId={songId}

              uploaded={media?.cover?.uploaded}

              onComplete={() => void afterUpload()}

            />

            <AudioUploader

              songId={songId}

              uploaded={media?.audio?.uploaded}

              onComplete={() => void afterUpload()}

            />

            <VideoUploader

              songId={songId}

              uploaded={media?.musicVideo?.uploaded}

              onComplete={() => void afterUpload()}

            />

          </div>

          {media?.audio?.uploaded && (
            <AudioProcessingPanel songId={draft.id} audio={media.audio} />
          )}

          <Button type="button" onClick={() => navigate(`/artist/songs/${draft.id}`)}>

            View song

          </Button>

        </section>

      )}

    </div>

  );

}


