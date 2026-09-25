import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../api/client";
import { VideoPreview } from "../components/video/VideoPreview";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import type { VideoCustomization } from "../features/video/types";

type ProjectDetail = {
  project: {
    id: string;
    song: { title: string; backgroundVideoUrl: string | null };
    template: { name: string; slug: string };
  };
  style: VideoCustomization;
  lyrics: unknown;
};

export function VideoEditorPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [style, setStyle] = useState<VideoCustomization | null>(null);
  const [renderJobId, setRenderJobId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<
    "YOUTUBE_16_9" | "TIKTOK_9_16" | "REELS_9_16" | "SQUARE_1_1"
  >("YOUTUBE_16_9");
  const [resolutionHeight, setResolutionHeight] = useState(1080);

  const detail = useQuery({
    queryKey: ["video-project", id],
    queryFn: () => apiGet<ProjectDetail>(`/api/v1/video-projects/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (detail.data?.style && !style) setStyle(detail.data.style);
  }, [detail.data, style]);

  useEffect(() => {
    const pref = (detail.data?.project as { customizations?: { preferredExportFormat?: typeof exportFormat } })
      ?.customizations?.preferredExportFormat;
    if (pref) setExportFormat(pref);
  }, [detail.data]);

  const saveStyle = useMutation({
    mutationFn: (patch: Partial<VideoCustomization>) =>
      apiPatch(`/api/v1/video-projects/${id}/customizations`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["video-project", id] }),
  });

  const render = useMutation({
    mutationFn: () =>
      apiPost<{ renderJobId: string }>(`/api/v1/video-projects/${id}/render`, {
        exportFormat,
        resolutionHeight,
      }),
    onSuccess: (res) => setRenderJobId(res.renderJobId),
  });

  const renderStatus = useQuery({
    queryKey: ["render-job", renderJobId],
    queryFn: () =>
      apiGet<{ job: { status: string; progress: number; message: string | null; outputVideoUrl: string | null } }>(
        `/api/v1/render-jobs/${renderJobId}`,
      ),
    enabled: Boolean(renderJobId),
    refetchInterval: (q) => {
      const s = q.state.data?.job.status;
      return s === "COMPLETED" || s === "FAILED" ? false : 2000;
    },
  });

  if (!id) return null;
  const s = style ?? detail.data?.style;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Video editor</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {detail.data?.project.song.title} · {detail.data?.project.template.name}
        </p>
      </div>

      {s && <VideoPreview style={s} />}

      {s && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Font</span>
            <Input
              value={s.fontFamily}
              onChange={(e) => setStyle({ ...s, fontFamily: e.target.value })}
              onBlur={() => void saveStyle.mutateAsync({ fontFamily: s.fontFamily })}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Text size</span>
            <Input
              type="number"
              value={s.fontSize}
              onChange={(e) => setStyle({ ...s, fontSize: Number(e.target.value) })}
              onBlur={() => void saveStyle.mutateAsync({ fontSize: s.fontSize })}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Text color</span>
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
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Highlight color</span>
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
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Position</span>
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
          <label className="block space-y-1 text-sm">
            <span className="text-zinc-400">Animation</span>
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
              <option value="karaoke-fill">Karaoke fill</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="text-zinc-400">Background</span>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={s.background.type}
              onChange={(e) => {
                const v = e.target.value as VideoCustomization["background"]["type"];
                const next = { ...s, background: { ...s.background, type: v } };
                setStyle(next);
                void saveStyle.mutateAsync({ background: next.background });
              }}
            >
              <option value="solid">Solid color</option>
              <option value="video">Music video (if uploaded)</option>
              <option value="cover">Cover art</option>
            </select>
          </label>
          {s.background.type === "solid" && (
            <label className="block space-y-1 text-sm">
              <span className="text-zinc-400">Background color</span>
              <Input
                type="color"
                value={s.background.color ?? "#0a0a0a"}
                onChange={(e) => {
                  const next = {
                    ...s,
                    background: { type: "solid" as const, color: e.target.value },
                  };
                  setStyle(next);
                  void saveStyle.mutateAsync({ background: next.background });
                }}
              />
            </label>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 border-t border-zinc-800 pt-6">
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Social format</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
          >
            <option value="YOUTUBE_16_9">YouTube 16:9</option>
            <option value="TIKTOK_9_16">TikTok 9:16</option>
            <option value="REELS_9_16">Instagram Reels 9:16</option>
            <option value="SQUARE_1_1">Square 1:1</option>
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Resolution height</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            value={resolutionHeight}
            onChange={(e) => setResolutionHeight(Number(e.target.value))}
          >
            <option value={1080}>1080p</option>
            <option value={1440}>1440p</option>
            <option value={2160}>4K (2160p)</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <Button type="button" disabled={render.isPending} onClick={() => void render.mutate()}>
          {render.isPending ? "Starting render…" : "Render video"}
        </Button>
        <Link to="/create/lyric-video">
          <Button type="button" variant="ghost">
            New project
          </Button>
        </Link>
      </div>

      {renderStatus.data?.job && (
        <div className="rounded-lg border border-zinc-800 p-4 text-sm">
          <p>
            Render: {renderStatus.data.job.status} ({renderStatus.data.job.progress}%)
          </p>
          <p className="text-zinc-500">{renderStatus.data.job.message}</p>
          {renderStatus.data.job.outputVideoUrl && (
            <a
              href={renderStatus.data.job.outputVideoUrl}
              className="mt-2 inline-block text-violet-400 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Download / play output
            </a>
          )}
        </div>
      )}
    </div>
  );
}
