import { Link } from "react-router-dom";
import type { MockupTemplatePreview } from "../../lib/mockupVisuals";
import { Badge } from "../ui/Badge";

type Props = {
  template: MockupTemplatePreview;
  compact?: boolean;
};

export function TemplatePreviewTile({ template, compact }: Props) {
  return (
    <Link
      to="/dashboard/templates"
      className="group block overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40 shadow-lg transition hover:border-blue-500/40 hover:shadow-blue-500/10"
    >
      <div
        className={`relative ${compact ? "aspect-[4/3]" : "aspect-video"} bg-gradient-to-br ${template.className}`}
      >
        {template.imageUrl && (
          <img
            src={template.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-90 transition group-hover:scale-105 duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge tone="accent" className="bg-blue-600/30 text-blue-100">
            {template.tag}
          </Badge>
          <p className={`mt-2 font-bold text-white drop-shadow-md ${compact ? "text-sm" : "text-lg"}`}>
            {template.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
