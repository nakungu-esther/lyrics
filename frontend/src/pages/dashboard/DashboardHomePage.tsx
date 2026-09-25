import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchDashboardSummary } from "../../api/auth";
import { authKeys } from "../../features/auth/queryKeys";
import { useAuth } from "../../features/auth/AuthContext";
import { QuickActionCard } from "../../components/ui/QuickActionCard";
import { StatCard } from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { MOCKUP_IMAGES } from "../../lib/mockupVisuals";

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const DEMO_PROJECTS = [
  { title: "My Worship Song", status: "Processing" as const, img: MOCKUP_IMAGES.projectThumb1, time: "45%" },
  { title: "Forever", status: "Completed" as const, img: MOCKUP_IMAGES.projectThumb2, time: "Completed" },
  { title: "Nze Mukama", status: "Completed" as const, img: MOCKUP_IMAGES.projectThumb3, time: "Completed" },
  { title: "Grace", status: "Completed" as const, img: MOCKUP_IMAGES.projectThumb1, time: "Completed" },
];

const DEMO_SONGS = [
  { title: "Nze nkuyagala", language: "Luganda", genre: "Gospel", status: "Completed" as const },
  { title: "City lights", language: "English", genre: "Afrobeat", status: "Processing" as const },
];

export function DashboardHomePage() {
  const { user } = useAuth();
  const dashboard = useQuery({
    queryKey: authKeys.dashboard,
    queryFn: fetchDashboardSummary,
  });

  const firstName =
    user?.firstName?.trim() || user?.displayName?.trim()?.split(/\s+/)[0] || "creator";

  const stats = dashboard.data?.stats;
  const showDemo = (stats?.videos ?? 0) === 0 && (stats?.songs ?? 0) === 0;

  return (
    <div className="space-y-8 pb-8 md:space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {timeGreeting()}, {firstName}
        </h1>
        <p className="mt-2 text-slate-400">Create amazing videos from your songs.</p>
      </div>

      {dashboard.isError && (
        <p className="text-sm text-amber-400/90" role="alert">
          Could not load stats. You can still create and edit projects.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Videos" value={showDemo ? 12 : stats?.videos ?? 0} href="/dashboard/videos" icon="videos" />
        <StatCard label="Total Songs" value={showDemo ? 8 : stats?.songs ?? 0} href="/dashboard/songs" icon="songs" />
        <StatCard
          label="Templates Used"
          value={showDemo ? 5 : Math.min(stats?.videos ?? 0, 5)}
          href="/dashboard/templates"
          icon="templates"
        />
        <StatCard label="Storage Used" value={showDemo ? "2.4 GB" : "—"} icon="upload" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard title="Upload Video" description="Turn your songs into lyric videos." href="/create?mode=video" icon="videoClip" />
          <QuickActionCard title="Upload Audio" description="Create lyric videos with audio." href="/create?mode=audio" icon="audio" />
          <QuickActionCard title="Create Lyric Video" description="Use AI to generate lyrics." href="/create" icon="sparkles" />
          <QuickActionCard title="Browse Templates" description="Explore curated templates." href="/dashboard/templates" icon="templates" />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-white">Recent Projects</h2>
          <Link to="/dashboard/projects" className="text-sm text-blue-400 hover:text-blue-300">
            View all
          </Link>
        </div>
        {showDemo ? (
          <div className="-mx-2 mt-5 flex gap-4 overflow-x-auto px-2 pb-2 snap-x">
            {DEMO_PROJECTS.map((p) => (
              <Link
                key={p.title}
                to="/create"
                className="w-56 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/50"
              >
                <div className="relative aspect-video">
                  <img src={p.img} alt="" className="h-full w-full object-cover" />
                  <Badge tone={p.status === "Completed" ? "success" : "warning"} className="absolute right-2 top-2">
                    {p.status}
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-200">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.time}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <Link to="/dashboard/videos">
              <Button type="button" variant="secondary" size="sm" leadingIcon="videos">
                Open my videos
              </Button>
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-white">Recent Songs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Language</th>
                <th className="pb-2 font-medium">Genre</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {showDemo
                ? DEMO_SONGS.map((s) => (
                    <tr key={s.title}>
                      <td className="py-3 font-medium text-slate-200">{s.title}</td>
                      <td className="py-3">{s.language}</td>
                      <td className="py-3">{s.genre}</td>
                      <td className="py-3">
                        <Badge tone={s.status === "Completed" ? "success" : "warning"}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))
                : (stats?.songs ?? 0) > 0 && (
                    <tr>
                      <td className="py-3" colSpan={4}>
                        <Link to="/dashboard/songs" className="text-blue-400 hover:underline">
                          View all songs →
                        </Link>
                      </td>
                    </tr>
                  )}
              {!showDemo && (stats?.songs ?? 0) === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={4}>
                    No songs yet.{" "}
                    <Link to="/create" className="text-blue-400 hover:underline">
                      Upload your first track
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
