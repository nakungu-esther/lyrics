import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HubIcon, type HubIconName } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description: string;
  /** Prefer `iconName` for consistent Lucide styling */
  iconName?: HubIconName;
  icon?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: HubIconName;
};

export function EmptyState({
  title,
  description,
  iconName,
  icon,
  actionHref,
  actionLabel,
  actionIcon,
}: EmptyStateProps) {
  const iconNode =
    icon ??
    (iconName ? (
      <HubIcon name={iconName} size={ICON_SIZE.empty} className="mx-auto text-zinc-500" strokeWidth={1.5} />
    ) : null);

  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
      {iconNode && <div className="mx-auto mb-4">{iconNode}</div>}
      <h2 className="text-lg font-medium text-zinc-100">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      {actionHref && actionLabel && (
        <div className="mt-6">
          <Link to={actionHref}>
            <Button type="button" leadingIcon={actionIcon}>
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
