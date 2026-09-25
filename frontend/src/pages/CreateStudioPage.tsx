import { useMutation } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFormPost } from "../api/client";
import { GenreSelect } from "../components/songs/GenreSelect";
import { ProcessingPipeline } from "../components/studio/ProcessingPipeline";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { HubIcon } from "../components/icons/HubIcon";
import { UploadZone } from "../components/ui/UploadZone";
import type { PipelinePhase } from "../lib/pipelineSteps";

type StudioMode = "VIDEO_CLIP" | "AUDIO_ONLY";

export function CreateStudioPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const initialMode =
    search.get("mode") === "audio"
      ? "AUDIO_ONLY"
      : search.get("mode") === "video"
        ? "VIDEO_CLIP"
        : "VIDEO_CLIP";

  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [subgenre, setSubgenre] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (search.get("mode") === "audio") setMode("AUDIO_ONLY");
    if (search.get("mode") === "video") setMode("VIDEO_CLIP");
  }, [search]);

  const start = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const form = new FormData();
      form.append("mode", mode);
      form.append("title", title.trim());
      if (genre.trim()) form.append("genre", genre.trim());
      if (mode === "VIDEO_CLIP" && video) form.append("video", video);
      if (mode === "AUDIO_ONLY" && audio) form.append("audio", audio);
      return apiFormPost<{ songId: string }>("/api/v1/creator/start", form);
    },
    onSuccess: (res) => navigate(`/studio/${res.songId}`),
    onError: (e: Error) => {
      setError(e.message);
      setUploading(false);
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    void start.mutateAsync();
  }

  const pipelinePhase: PipelinePhase = uploading ? "UPLOADING" : "UPLOADING";

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-sm font-medium text-indigo-300">LyricsHub Studio</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Upload &amp; create</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Drag your file—we run language detection, lyrics generation, and sync automatically. You
          only customize the look afterward.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("VIDEO_CLIP")}
          className={`rounded-2xl border p-5 text-left transition hub-card ${
            mode === "VIDEO_CLIP" ? "border-indigo-500/60 ring-1 ring-indigo-500/30" : ""
          }`}
        >
          <HubIcon name="videoClip" className="text-indigo-400" size={32} />
          <h2 className="mt-2 text-lg font-semibold text-white">Video + lyrics</h2>
          <p className="mt-2 text-sm text-zinc-500">
            MP4, MOV, WebM—your clip plays while lyrics overlay on top.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("AUDIO_ONLY")}
          className={`rounded-2xl border p-5 text-left transition hub-card ${
            mode === "AUDIO_ONLY" ? "border-indigo-500/60 ring-1 ring-indigo-500/30" : ""
          }`}
        >
          <HubIcon name="audio" className="text-indigo-400" size={32} />
          <h2 className="mt-2 text-lg font-semibold text-white">Audio + template</h2>
          <p className="mt-2 text-sm text-zinc-500">
            MP3, WAV, M4A, AAC, FLAC—pick a visual template in the editor.
          </p>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-900 shadow-xl md:p-8"
        >
          <Card padding="lg" className="!border-slate-200 !bg-white !text-slate-900">
            {mode === "VIDEO_CLIP" ? (
              <UploadZone
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                hint="Drop your video clip here"
                formats="MP4 · MOV · WebM — max 500MB"
                file={video}
                onFile={setVideo}
                icon="videoClip"
                light
              />
            ) : (
              <UploadZone
                accept="audio/*,.mp3,.wav,.m4a,.aac,.flac"
                hint="Drop your audio track here"
                formats="MP3 · WAV · M4A · AAC · FLAC"
                file={audio}
                onFile={setAudio}
                icon="audio"
                light
              />
            )}
          </Card>

          <Card className="space-y-4 !border-slate-200 !bg-white !text-slate-900">
            <label className="block space-y-1.5 text-sm">
              <span className="text-slate-600">Song / project title</span>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My song title"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-slate-600">Genre (optional)</span>
              <GenreSelect
                genre={genre}
                subgenre={subgenre}
                onChange={(patch) => {
                  if (patch.genre !== undefined) setGenre(patch.genre);
                  if (patch.subgenre !== undefined) setSubgenre(patch.subgenre);
                }}
              />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={start.isPending || (mode === "VIDEO_CLIP" ? !video : !audio)}
              className="w-full sm:w-auto"
              size="lg"
            >
              {start.isPending ? "Uploading & starting AI…" : "Start — AI handles the rest"}
            </Button>
          </Card>
        </form>

        <ProcessingPipeline
          phase={start.isPending ? pipelinePhase : "UPLOADING"}
          message={start.isPending ? "Uploading your file…" : "Waiting for upload"}
          progress={start.isPending ? 35 : 0}
        />
      </div>

      <p className="text-xs text-zinc-600">
        <Link to="/dashboard/templates" className="text-indigo-400 hover:underline">
          Browse templates
        </Link>{" "}
        before you upload audio, or change templates anytime in the studio editor.
      </p>
    </div>
  );
}
