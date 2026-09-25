import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { Button } from "../components/ui/Button";
import type { SongForVideo, VideoTemplate } from "../features/video/types";

type Step = "song" | "lyrics" | "template";

export function CreateVideoProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("song");
  const [songId, setSongId] = useState<string | null>(null);
  const [lyricsId, setLyricsId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const songs = useQuery({
    queryKey: ["video", "songs"],
    queryFn: () => apiGet<{ songs: SongForVideo[] }>("/api/v1/video-projects/songs"),
  });

  const templates = useQuery({
    queryKey: ["video-templates"],
    queryFn: () => apiGet<{ templates: VideoTemplate[] }>("/api/v1/video-templates"),
  });

  const create = useMutation({
    mutationFn: () =>
      apiPost<{ project: { id: string } }>("/api/v1/video-projects", {
        songId,
        lyricsId,
        templateId,
      }),
    onSuccess: (res) => navigate(`/artist/videos/${res.project.id}`),
  });

  const selectedSong = songs.data?.songs.find((s) => s.id === songId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Create lyrics video</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Select song → lyrics → template
        </p>
      </div>

      {step === "song" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">1. Select song</h2>
          <ul className="space-y-2">
            {(songs.data?.songs ?? []).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-4 py-3 text-left ${
                    songId === s.id ? "border-violet-500 bg-violet-950/20" : "border-zinc-800"
                  }`}
                  onClick={() => setSongId(s.id)}
                >
                  {s.title}
                  {s.mediaSource === "MUSIC_VIDEO" && (
                    <span className="ml-2 text-xs text-cyan-400">Music video</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {(!songs.data?.songs.length && !songs.isLoading) && (
            <p className="text-sm text-zinc-500">Upload a song with audio first.</p>
          )}
          <Button type="button" disabled={!songId} onClick={() => setStep("lyrics")}>
            Next
          </Button>
        </div>
      )}

      {step === "lyrics" && selectedSong && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">2. Select lyrics</h2>
          <ul className="space-y-2">
            {selectedSong.lyrics.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-4 py-3 text-left ${
                    lyricsId === l.id ? "border-violet-500 bg-violet-950/20" : "border-zinc-800"
                  }`}
                  onClick={() => setLyricsId(l.id)}
                >
                  Version {l.version} — {l.status.replace(/_/g, " ")}
                </button>
              </li>
            ))}
          </ul>
          {!selectedSong.lyrics.length && (
            <p className="text-sm text-amber-400/90">
              No lyrics yet.{" "}
              <Link to={`/artist/songs/${selectedSong.id}/lyrics`} className="underline">
                Generate or add lyrics
              </Link>
            </p>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("song")}>
              Back
            </Button>
            <Button type="button" disabled={!lyricsId} onClick={() => setStep("template")}>
              Next
            </Button>
          </div>
        </div>
      )}

      {step === "template" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">3. Select template</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(templates.data?.templates ?? []).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`rounded-xl border p-4 text-left ${
                  templateId === t.id ? "border-violet-500 bg-violet-950/20" : "border-zinc-800"
                }`}
                onClick={() => setTemplateId(t.id)}
              >
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{t.description}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("lyrics")}>
              Back
            </Button>
            <Button
              type="button"
              disabled={!templateId || create.isPending}
              onClick={() => void create.mutate()}
            >
              {create.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </div>
      )}

      <Link to="/artist/dashboard" className="text-sm text-violet-400 hover:underline">
        Artist dashboard
      </Link>
    </div>
  );
}
