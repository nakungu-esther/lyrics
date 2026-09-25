import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFormPost, apiGet } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { UploadJob } from "../features/artist/types";

type UploadPhase = "idle" | "uploading" | "processing" | "ready" | "failed";

function StatusBanner({ phase, message }: { phase: UploadPhase; message?: string }) {
  const labels: Record<UploadPhase, string> = {
    idle: "",
    uploading: "Uploading…",
    processing: "Processing…",
    ready: "Ready",
    failed: "Failed",
  };
  if (phase === "idle") return null;
  const tone =
    phase === "ready"
      ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
      : phase === "failed"
        ? "border-red-800 bg-red-950/40 text-red-300"
        : "border-violet-800 bg-violet-950/40 text-violet-200";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tone}`}>
      <p className="font-medium">{labels[phase]}</p>
      {message && <p className="mt-1 text-zinc-400">{message}</p>}
    </div>
  );
}

export function NewSongPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [songId, setSongId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => apiGet<{ job: UploadJob }>(`/api/v1/jobs/${jobId}`),
    enabled: Boolean(jobId) && phase === "processing",
    refetchInterval: (query) => {
      const status = query.state.data?.job.status;
      if (status === "COMPLETED" || status === "FAILED") return false;
      return 1500;
    },
  });

  const songPoll = useQuery({
    queryKey: ["song-upload", songId],
    queryFn: () =>
      apiGet<{ song: { detectedLanguageCode: string | null } }>(`/api/v1/songs/${songId}`),
    enabled: Boolean(songId) && phase === "processing",
    refetchInterval: 2000,
  });

  useEffect(() => {
    const job = jobQuery.data?.job;
    if (job?.status === "FAILED") {
      setPhase("failed");
      setError(job.error ?? "Processing failed");
    }
  }, [jobQuery.data]);

  useEffect(() => {
    if (songPoll.data?.song.detectedLanguageCode && songId) {
      setPhase("ready");
      navigate(`/artist/songs/${songId}/language`);
    }
  }, [songPoll.data, songId, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!audio) {
      setError("Choose an audio file");
      return;
    }
    setError(null);
    setPhase("uploading");

    const form = new FormData();
    form.append("title", title);
    if (albumTitle) form.append("albumTitle", albumTitle);
    if (genre) form.append("genre", genre);
    if (releaseDate) form.append("releaseDate", releaseDate);
    form.append("audio", audio);
    if (cover) form.append("cover", cover);

    try {
      const res = await apiFormPost<{
        song: { id: string };
        job: UploadJob;
      }>("/api/v1/songs/upload/with-audio", form);
      setSongId(res.song.id);
      setJobId(res.job.id);
      setPhase("processing");
    } catch (err) {
      setPhase("failed");
      setError(err instanceof ApiError ? err.message : "Upload failed");
    }
  }

  const processingMessage =
    jobQuery.data?.job.message ??
    (phase === "uploading" ? "Sending files to the server…" : undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Add song</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Audio is stored in object storage; metadata lives in PostgreSQL.
        </p>
      </div>

      <StatusBanner phase={phase} message={processingMessage} />
      {error && phase === "failed" && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {phase !== "ready" && (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Song title</span>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Album (optional — creates new)</span>
            <Input
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Genre</span>
            <Input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Release date</span>
            <Input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Cover image</span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-zinc-400">Audio file</span>
            <Input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
              disabled={phase === "uploading" || phase === "processing"}
            />
          </label>
          <Button
            type="submit"
            disabled={phase === "uploading" || phase === "processing"}
          >
            {phase === "uploading" ? "Uploading…" : "Upload"}
          </Button>
        </form>
      )}

      {phase === "ready" && (
        <div className="space-y-4">
          <p className="text-zinc-300">Your song is processed and ready for review.</p>
          <Link to="/artist/dashboard">
            <Button type="button">Back to dashboard</Button>
          </Link>
        </div>
      )}

      <Link to="/artist/dashboard" className="text-sm text-violet-400 hover:underline">
        Artist dashboard
      </Link>
    </div>
  );
}
