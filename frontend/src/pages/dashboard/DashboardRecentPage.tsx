import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardRecentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Recently Played</h1>
      <EmptyState
        title="No recently played songs"
        description="When you listen on LyricsHub, your recent tracks will show up here."
      />
    </div>
  );
}
