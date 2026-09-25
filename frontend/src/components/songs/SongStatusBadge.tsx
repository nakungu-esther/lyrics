import type { SongStatus } from "../../features/songs/types";

const LABELS: Record<SongStatus, string> = {
  DRAFT: "Draft",
  PROCESSING: "Processing",
  AUDIO_READY: "Audio ready",
  LANGUAGE_CONFIRMED: "Language confirmed",
  READY_FOR_REVIEW: "Ready for review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STYLES: Record<SongStatus, string> = {
  DRAFT: "bg-zinc-800 text-zinc-300",
  PROCESSING: "bg-amber-500/15 text-amber-200",
  AUDIO_READY: "bg-violet-500/15 text-violet-200",
  LANGUAGE_CONFIRMED: "bg-indigo-500/15 text-indigo-200",
  READY_FOR_REVIEW: "bg-sky-500/15 text-sky-200",
  PUBLISHED: "bg-emerald-500/15 text-emerald-200",
  ARCHIVED: "bg-zinc-800 text-zinc-500",
};

export function SongStatusBadge({ status }: { status: SongStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
      aria-label={`Status: ${LABELS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
