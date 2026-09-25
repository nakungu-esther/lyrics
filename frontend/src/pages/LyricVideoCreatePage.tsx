import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFormPost, apiGet, apiPost } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { SongForVideo, VideoTemplate } from "../features/video/types";
import { HubIcon, templateIconName } from "../components/icons/HubIcon";
import { DEFAULT_EXPORT_PRESETS, type ExportFormatId } from "../lib/exportFormats";

type Step = "intro" | "clip" | "lyrics" | "template" | "done";

type TemplatesResponse = {
  templates: VideoTemplate[];
  exportFormats?: typeof DEFAULT_EXPORT_PRESETS;
};

export function LyricVideoCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetSongId = params.get("songId");

  const [step, setStep] = useState<Step>(presetSongId ? "lyrics" : "intro");
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [uploadedSongId, setUploadedSongId] = useState<string | null>(presetSongId);
  const [songId, setSongId] = useState<string | null>(presetSongId);
  const [lyricsId, setLyricsId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormatId>("TIKTOK_9_16");
  const [error, setError] = useState<string | null>(null);

  const templatesQuery = useQuery({
    queryKey: ["video-templates"],
    queryFn: () => apiGet<TemplatesResponse>("/api/v1/video-templates"),
  });

  const songsQuery = useQuery({
    queryKey: ["video", "songs"],
    queryFn: () => apiGet<{ songs: SongForVideo[] }>("/api/v1/video-projects/songs"),
    enabled: step === "lyrics" || step === "template",
  });

  const exportPresets =
    templatesQuery.data?.exportFormats?.length
      ? templatesQuery.data.exportFormats
      : DEFAULT_EXPORT_PRESETS;

  const selectedSong = useMemo(
    () => songsQuery.data?.songs.find((s) => s.id === songId),
    [songsQuery.data, songId],
  );

  const uploadClip = useMutation({
    mutationFn: async () => {
      if (!video) throw new Error("Choose a video clip");
      const form = new FormData();
      form.append("title", title.trim());
      form.append("video", video);
      return apiFormPost<{
        song: { id: string };
        nextSteps: { language: string; lyrics: string };
      }>("/api/v1/creator/clip", form);
    },
    onSuccess: (res) => {
      setUploadedSongId(res.song.id);
      setSongId(res.song.id);
      setStep("lyrics");
    },
    onError: (e: Error) => setError(e.message),
  });

  const createProject = useMutation({
    mutationFn: () =>
      apiPost<{ project: { id: string } }>("/api/v1/video-projects", {
        songId,
        lyricsId,
        templateId,
        exportFormat,
      }),
    onSuccess: (res) => navigate(`/my/videos/${res.project.id}`),
  });

  async function onClipSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    await uploadClip.mutateAsync();
  }

  const templates = templatesQuery.data?.templates ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Lyric video
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Create a lyrics video</h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          For <strong className="text-zinc-200">anyone</strong> with a phone clip—not only verified
          artists. Upload a short video → attach a song → AI generates or accepts lyrics → sync to
          audio → pick a template → customize → preview → export.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-xs text-zinc-500">
        {(
          [
            ["intro", "Start"],
            ["clip", "Clip & song"],
            ["lyrics", "Lyrics"],
            ["template", "Template"],
          ] as const
        ).map(([key, label]) => (
          <li
            key={key}
            className={
              step === key
                ? "rounded-full bg-violet-600/20 px-3 py-1 text-violet-200"
                : "rounded-full border border-zinc-800 px-3 py-1"
            }
          >
            {label}
          </li>
        ))}
      </ol>

      {step === "intro" && (
        <section className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-medium">How it works</h2>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li>1. Upload a video clip (e.g. 30s from your gallery).</li>
            <li>2. We extract audio, detect language, and transcribe sung lyrics (or paste your own).</li>
            <li>3. Lyrics are synchronized to the audio—word-level for karaoke templates.</li>
            <li>4. Choose a lyric-video template and export format (TikTok, YouTube, square).</li>
            <li>5. Customize fonts, colors, position → preview → render.</li>
          </ul>
          <Button type="button" onClick={() => setStep("clip")}>
            Get started
          </Button>
        </section>
      )}

      {step === "clip" && (
        <form onSubmit={(e) => void onClipSubmit(e)} className="space-y-4">
          <h2 className="text-lg font-medium">Upload your clip</h2>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Title</span>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My chorus clip"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Video clip (MP4)</span>
            <Input
              type="file"
              accept="video/mp4,video/*"
              required
              onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Tip: use <strong>Music Video Overlay</strong> later to keep this clip as the background.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("intro")}>
              Back
            </Button>
            <Button type="submit" disabled={uploadClip.isPending}>
              {uploadClip.isPending ? "Uploading…" : "Upload & continue"}
            </Button>
          </div>
        </form>
      )}

      {step === "lyrics" && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Song & lyrics</h2>
          {!songId && (
            <ul className="space-y-2">
              {(songsQuery.data?.songs ?? []).map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-4 py-3 text-left ${
                      songId === s.id ? "border-violet-500 bg-violet-950/20" : "border-zinc-800"
                    }`}
                    onClick={() => setSongId(s.id)}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {songId && (
            <>
              <p className="text-sm text-zinc-400">
                Song ID: {songId}
                {uploadedSongId === songId && " (your new clip)"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/artist/songs/${songId}/language`}>
                  <Button type="button" variant="ghost">
                    Confirm language
                  </Button>
                </Link>
                <Link to={`/artist/songs/${songId}/lyrics`}>
                  <Button type="button" variant="ghost">
                    Edit / generate lyrics
                  </Button>
                </Link>
                <Link to="/lrc-studio">
                  <Button type="button" variant="ghost">
                    LRC Studio (tap sync)
                  </Button>
                </Link>
              </div>
              {selectedSong && selectedSong.lyrics.length > 0 && (
                <ul className="space-y-2">
                  {selectedSong.lyrics.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        className={`w-full rounded-lg border px-4 py-3 text-left ${
                          lyricsId === l.id
                            ? "border-violet-500 bg-violet-950/20"
                            : "border-zinc-800"
                        }`}
                        onClick={() => setLyricsId(l.id)}
                      >
                        Lyrics v{l.version} — {l.status.replace(/_/g, " ")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("clip")}>
              Back
            </Button>
            <Button
              type="button"
              disabled={!songId || !lyricsId}
              onClick={() => setStep("template")}
            >
              Choose template
            </Button>
          </div>
        </section>
      )}

      {step === "template" && (
        <section className="space-y-6">
          <h2 className="text-lg font-medium">Template & format</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`rounded-xl border p-4 text-left transition ${
                  templateId === t.id
                    ? "border-violet-500 bg-violet-950/25"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
                onClick={() => {
                  setTemplateId(t.id);
                  const suggested = (t.config as { suggestedExportFormat?: ExportFormatId })
                    .suggestedExportFormat;
                  if (suggested) setExportFormat(suggested);
                }}
              >
                <HubIcon name={templateIconName(t.config)} className="text-indigo-300" size={28} />
                <p className="mt-2 font-medium">{t.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{t.description}</p>
              </button>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-300">Export shape</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exportPresets.map((p) => (
                <button
                  key={p.format}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${
                    exportFormat === p.format
                      ? "border-cyan-500/60 bg-cyan-950/20"
                      : "border-zinc-800"
                  }`}
                  onClick={() => setExportFormat(p.format)}
                >
                  <HubIcon name={p.icon} size={16} className="mr-2 inline-block align-text-bottom" />
                  {p.label}
                  <span className="block text-xs text-zinc-500">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep("lyrics")}>
              Back
            </Button>
            <Button
              type="button"
              disabled={!templateId || createProject.isPending}
              onClick={() => void createProject.mutate()}
            >
              {createProject.isPending ? "Creating…" : "Customize & preview"}
            </Button>
          </div>
        </section>
      )}

      <p className="text-xs text-zinc-600">
        Registered artists can also start from{" "}
        <Link to="/artist/videos/new" className="text-violet-400 hover:underline">
          artist video projects
        </Link>
        .
      </p>
    </div>
  );
}
