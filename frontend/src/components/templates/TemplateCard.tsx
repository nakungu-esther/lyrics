import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type TemplateCardProps = {
  id: string;
  name: string;
  category?: string;
  gradientClass: string;
  previewImageUrl?: string;
  aspectLabel?: string;
  previewHref?: string;
  onUse?: () => void;
  useHref?: string;
};

export function TemplateCard({
  name,
  category,
  gradientClass,
  previewImageUrl,
  aspectLabel,
  onUse,
  useHref,
  previewHref,
}: TemplateCardProps) {
  return (
    <Card padding="none" hover className="overflow-hidden">
      <div
        className={`relative aspect-video bg-gradient-to-br ${gradientClass} flex items-end p-4`}
      >
        {previewImageUrl && (
          <img
            src={previewImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-85"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <p className="relative text-lg font-bold text-white drop-shadow-md">{name}</p>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {category && <Badge tone="accent">{category}</Badge>}
          {aspectLabel && <Badge>{aspectLabel}</Badge>}
        </div>
        <div className="flex gap-2">
          {previewHref && (
            <Link to={previewHref} className="flex-1">
              <Button type="button" variant="ghost" className="w-full border border-zinc-700">
                Preview
              </Button>
            </Link>
          )}
          {useHref ? (
            <Link to={useHref} className="flex-1">
              <Button type="button" className="w-full">
                Use template
              </Button>
            </Link>
          ) : (
            <Button type="button" className="flex-1" onClick={onUse}>
              Use template
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
