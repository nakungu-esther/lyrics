import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardSongsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">My Songs</h1>
      <EmptyState
        title="No songs yet"
        description="Upload your first song when you're ready. Song upload and processing are not part of this step."
      />
    </div>
  );
}
