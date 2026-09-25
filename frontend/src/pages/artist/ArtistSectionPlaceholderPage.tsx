import { ArtistEmptyState } from "../../components/artist/ArtistEmptyState";

export function ArtistSectionPlaceholderPage({
  title,
  emptyTitle,
  emptyDescription,
  actionHref,
  actionLabel,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <ArtistEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={actionHref}
        actionLabel={actionLabel}
      />
    </div>
  );
}
