import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My projects</h1>
        <p className="mt-2 text-zinc-400">
          Drafts and in-progress lyric videos. Upload to start a new project.
        </p>
      </div>
      <Card>
        <EmptyState
          title="No projects yet"
          description="Create a lyrics video from video or audio—we'll save your project as you go."
          actionHref="/create"
          actionLabel="Create lyrics video"
        />
      </Card>
      <p className="text-sm text-zinc-600">
        Tip: open <Link to="/dashboard/videos" className="text-indigo-400">My Videos</Link> for
        rendered exports.
      </p>
    </div>
  );
}
