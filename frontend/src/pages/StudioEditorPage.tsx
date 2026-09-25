import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../api/client";
import { StudioLivePreview } from "../components/video/StudioLivePreview";
import { ProcessingPipeline } from "../components/studio/ProcessingPipeline";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { PipelinePhase } from "../lib/pipelineSteps";
import { Input } from "../components/ui/Input";
import type { VideoCustomization, VideoTemplate } from "../features/video/types";
import { HubIcon, templateIconName } from "../components/icons/HubIcon";
import { DEFAULT_EXPORT_PRESETS, type ExportFormatId } from "../lib/exportFormats";

type StudioResponse = {
  song: {
    id: string;
    title: string;
    creatorStudioMode: string | null;
    audioUrl: string | null;
    backgroundVideoUrl: string | null;
  };
  pipeline: {
    phase: string;
    message: string;
    progress: number;
    projectId: string | null;
  };
  editor: {
    project: { id: string; template: { id: string; slug: string; name: string } };
    style: VideoCustomization;
  } | null;
};

export function StudioEditorPage() {
  const { songId } = useParams<{ songId: string }>();
  const queryClient = useQueryClient();
  const [style, setStyle] = useState<VideoCustomization | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormatId>("CANVAS_4_3");
  const [renderJobId, setRenderJobId] = useState<string | null>(null);

  const studio = useQuery({
    queryKey: ["studio", songId],
    queryFn: () => apiGet<StudioResponse>(`/api/v1/studio/songs/${songId}`),
    enabled: Boolean(songId),
    refetchInterval: (q) => (q.state.data?.pipeline.phase === "READY" ? false : 2000),
  });

  const templates = useQuery({
    queryKey: ["video-templates"],
    queryFn: () =>
      apiGet<{ templates: VideoTemplate[] }>("/api/v1/video-templates"),
  });

  const projectId = studio.data?.pipeline.projectId ?? studio.data?.editor?.project.id;

  useEffect(() => {
    if (studio.data?.editor?.style && !style) {
      setStyle(studio.data.editor.style);
      const pref = (studio.data.editor.style as VideoCustomization & { preferredExportFormat?: ExportFormatId })
        .preferredExportFormat;
      if (pref) setExportFormat(pref);
    }
  }, [studio.data, style]);

  const saveStyle = useMutation({
    mutationFn: (patch: Partial<VideoCustomization>) =>
      apiPatch(`/api/v1/video-projects/${projectId}/customizations`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio", songId] }),
  });

  const swapTemplate = useMutation({
    mutationFn: (templateId: string) =>
      apiPost(`/api/v1/video-projects/${projectId}/template`, { templateId }),
    onSuccess: () => {
      setStyle(null);
      void queryClient.invalidateQueries({ queryKey: ["studio", songId] });
    },
  });

  const render = useMutation({
    mutationFn: () =>
      apiPost<{ renderJobId: string }>(`/api/v1/video-projects/${projectId}/render`, {
        exportFormat,
        resolutionHeight: 1080,
      }),
    onSuccess: (res) => setRenderJobId(res.renderJobId),
  });

  const renderStatus = useQuery({
    queryKey: ["render-job", renderJobId],
    queryFn: () =>
      apiGet<{ job: { status: string; progress: number; outputVideoUrl: string | null; message: string | null } }>(
        `/api/v1/render-jobs/${renderJobId}`,
      ),
    enabled: Boolean(renderJobId),
    refetchInterval: (q) =>
      q.state.data?.job.status === "COMPLETED" || q.state.data?.job.status === "FAILED" ? false : 2000,
  });

  const aspect = useMemo(() => {
    if (exportFormat === "TIKTOK_9_16" || exportFormat === "REELS_9_16") return "9/16" as const;
    if (exportFormat === "SQUARE_1_1") return "1/1" as const;
    if (exportFormat === "CANVAS_4_3") return "4/3" as const;
    return "16/9" as const;
  }, [exportFormat]);

  if (!songId) return null;

  const song = studio.data?.song;
  const pipeline = studio.data?.pipeline;
  const aiWorking = pipeline && pipeline.phase !== "READY" && pipeline.phase !== "FAILED";
  const s = style ?? studio.data?.editor?.style;

  const defaultBg =
    song?.creatorStudioMode === "VIDEO_CLIP" ? "video" : (s?.background.type ?? "solid");

  const renderActive =
    renderStatus.data?.job?.status === "PROCESSING" ||
    renderStatus.data?.job?.status === "QUEUED";
  const displayPhase: PipelinePhase = renderActive
    ? "RENDERING"
    : (pipeline?.phase as PipelinePhase) ?? "UPLOADING";

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/create" className="text-sm text-indigo-400 hover:underline">
            ← New project
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">{song?.title ?? "Studio"}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {song?.creatorStudioMode === "VIDEO_CLIP" ? "Video + lyrics" : "Audio + template"} ·
            LyricsHub editor
          </p>
        </div>
        {pipeline?.phase === "READY" && !renderActive && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
            Ready for editing
          </span>
        )}
      </div>

      {pipeline?.phase === "FAILED" && (
        <p className="text-sm text-red-400">{pipeline.message}</p>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-300/80">
            Live preview
          </h2>
          {s && (
            <StudioLivePreview
              style={{
                ...s,
                background:
                  s.background.type === "video" || defaultBg === "video"
                    ? { type: "video" }
                    : s.background,
              }}
              videoUrl={song?.backgroundVideoUrl}
              audioUrl={song?.audioUrl}
              aspect={aspect}
            />
          )}
        </div>

        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <HubIcon name="templates" size={16} className="text-indigo-300" />
              Templates
            </h2>
            <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
              {(templates.data?.templates ?? []).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!projectId || swapTemplate.isPending}
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-left text-xs hover:border-zinc-600 disabled:opacity-50"
                  onClick={() => void swapTemplate.mutate(t.id)}
                >
                  <HubIcon
                    name={templateIconName(t.config)}
                    size={14}
                    className="mr-1.5 inline-block align-text-bottom text-indigo-300"
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </Card>

          {s && projectId && (
            <Card className="grid gap-3 sm:grid-cols-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-white sm:col-span-2">
                <HubIcon name="type" size={16} className="text-indigo-300" />
                Typography
              </p>
              <label className="text-sm space-y-1">
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <HubIcon name="font" size={14} />
                  Font
                </span>
                <Input
                  value={s.fontFamily}
                  onChange={(e) => setStyle({ ...s, fontFamily: e.target.value })}
                  onBlur={() => void saveStyle.mutateAsync({ fontFamily: s.fontFamily })}
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-zinc-500">Size</span>
                <Input
                  type="number"
                  value={s.fontSize}
                  onChange={(e) => setStyle({ ...s, fontSize: Number(e.target.value) })}
                  onBlur={() => void saveStyle.mutateAsync({ fontSize: s.fontSize })}
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <HubIcon name="color" size={14} />
                  Text color
                </span>
                <Input
                  type="color"
                  value={s.textColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStyle({ ...s, textColor: v });
                    void saveStyle.mutateAsync({ textColor: v });
                  }}
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-zinc-500">Highlight</span>
                <Input
                  type="color"
                  value={s.highlightColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStyle({ ...s, highlightColor: v });
                    void saveStyle.mutateAsync({ highlightColor: v });
                  }}
                />
              </label>
              <label className="text-sm space-y-1 sm:col-span-2">
                <span className="text-zinc-500">Text shadow (CSS)</span>
                <Input
                  placeholder="0 2px 8px rgba(0,0,0,0.8)"
                  value={(s as VideoCustomization & { textShadow?: string }).textShadow ?? ""}
                  onChange={(e) =>
                    setStyle({ ...s, textShadow: e.target.value } as VideoCustomization)
                  }
                  onBlur={() =>
                    void saveStyle.mutateAsync({
                      textShadow: (s as VideoCustomization & { textShadow?: string }).textShadow,
                    } as Partial<VideoCustomization>)
                  }
                />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-zinc-500">Position</span>
                <select
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                  value={s.position}
                  onChange={(e) => {
                    const v = e.target.value as VideoCustomization["position"];
                    setStyle({ ...s, position: v });
                    void saveStyle.mutateAsync({ position: v });
                  }}
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <HubIcon name="effects" size={14} />
                  Animation
                </span>
                <select
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
                  value={s.animation}
                  onChange={(e) => {
                    const v = e.target.value as VideoCustomization["animation"];
                    setStyle({ ...s, animation: v });
                    void saveStyle.mutateAsync({ animation: v });
                  }}
                >
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="karaoke-fill">Karaoke</option>
                </select>
              </label>
            </Card>
          )}

          <Card className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <HubIcon name="download" size={16} className="text-indigo-300" />
              Export &amp; render
            </h2>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_EXPORT_PRESETS.map((p) => (
                <button
                  key={p.format}
                  type="button"
                  className={`rounded-lg border px-3 py-1.5 text-xs ${
                    exportFormat === p.format ? "border-cyan-500 bg-cyan-950/30" : "border-zinc-800"
                  }`}
                  onClick={() => setExportFormat(p.format)}
                >
                  <HubIcon name={p.icon} size={14} className="mr-1 inline-block align-text-bottom" />
                  {p.label}
                </button>
              ))}
            </div>
          </Card>

          <Button
            type="button"
            leadingIcon="sparkles"
            disabled={!projectId || render.isPending || aiWorking}
            onClick={() => void render.mutate()}
          >
            {render.isPending ? "Starting render…" : "Render final video"}
          </Button>

          {renderStatus.data?.job?.outputVideoUrl && (
            <a
              href={renderStatus.data.job.outputVideoUrl}
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              <HubIcon name="download" size={16} />
              Download finished video
            </a>
          )}
        </div>
        </div>

        {(aiWorking || renderActive || (pipeline && pipeline.phase !== "READY")) && pipeline && (
          <ProcessingPipeline
            phase={displayPhase}
            message={renderActive ? (renderStatus.data?.job.message ?? "Rendering video…") : pipeline.message}
            progress={renderActive ? renderStatus.data?.job.progress ?? 50 : pipeline.progress}
            showRenderStep
          />
        )}
      </div>
    </div>
  );
}
