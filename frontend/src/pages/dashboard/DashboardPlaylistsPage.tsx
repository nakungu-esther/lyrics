import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardPlaylistsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Playlists</h1>
      <EmptyState
        title="No playlists yet"
        description="Create playlists to organize your favorite Luganda and regional tracks—coming in a future step."
      />
    </div>
  );
}
