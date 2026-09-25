import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardVideosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Videos</h1>
      <EmptyState
        title="No lyric videos yet"
        description="Lyrics-video projects will appear here once video creation is enabled."
      />
    </div>
  );
}
