import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiGet } from "../../api/client";
import { TemplateCard } from "../../components/templates/TemplateCard";
import { HubIcon } from "../../components/icons/HubIcon";
import { TEMPLATE_CATEGORIES, TEMPLATE_GRADIENTS } from "../../lib/contentCatalog";
import { ASPECT_RATIO_PRESETS, MOCKUP_TEMPLATE_PREVIEWS } from "../../lib/mockupVisuals";
import type { VideoTemplate } from "../../features/video/types";

export function TemplatesGalleryPage() {
  const [category, setCategory] = useState<string>("All");

  const templates = useQuery({
    queryKey: ["video-templates"],
    queryFn: () => apiGet<{ templates: VideoTemplate[] }>("/api/v1/video-templates"),
  });

  const filtered = useMemo(() => {
    const list = templates.data?.templates ?? [];
    if (category === "All") return list;
    const needle = category.toLowerCase();
    return list.filter((t) => {
      const cfg = t.config as { tags?: string[]; category?: string; family?: string } | undefined;
      const tags = (cfg?.tags ?? []).map((x) => x.toLowerCase());
      const cat = (cfg?.category ?? "").toLowerCase();
      if (needle === "worship") {
        return tags.includes("worship") || t.name.toLowerCase().includes("worship");
      }
      if (needle === "karaoke") {
        return tags.includes("karaoke") || cfg?.family === "karaoke";
      }
      if (needle === "modern") {
        return tags.includes("modern") || t.name.toLowerCase().includes("modern");
      }
      if (needle === "nature") {
        return tags.includes("nature") || t.name.toLowerCase().includes("nature");
      }
      return tags.some((tag) => tag.includes(needle)) || cat === needle || t.name.toLowerCase().includes(needle);
    });
  }, [templates.data, category]);

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Template Gallery</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Original LyricsHub styles—Gospel, Afrobeat, romantic, cinematic, and karaoke. Pick a look,
          then upload your audio or video.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {templates.isLoading && (
        <p className="text-sm text-slate-500 animate-pulse-soft">Loading templates…</p>
      )}

      {templates.isError && (
        <p className="text-sm text-amber-400">Could not load templates. Try again shortly.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t, i) => {
          const mock = MOCKUP_TEMPLATE_PREVIEWS.find((m) =>
            t.name.toLowerCase().includes(m.name.split(" ")[0]!.toLowerCase()),
          );
          return (
            <TemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              category={t.config?.family ?? undefined}
              gradientClass={mock?.className ?? TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length]!}
              previewImageUrl={mock?.imageUrl}
              aspectLabel="4:3 · 9:16 · 16:9"
              useHref="/create"
            />
          );
        })}
      </div>

      {!templates.isLoading && filtered.length === 0 && (
        <p className="text-center text-slate-500">No templates in this category yet.</p>
      )}

      <section className="hub-card rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white">Aspect ratio presets</h2>
        <p className="mt-1 text-sm text-slate-400">Choose orientation when you export from the studio.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ASPECT_RATIO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-4 rounded-xl border border-slate-600/80 bg-slate-800/60 p-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
                <HubIcon name={preset.icon} size={22} />
              </span>
              <div>
                <p className="font-medium text-white">{preset.label}</p>
                <p className="text-xs text-slate-500">{preset.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
