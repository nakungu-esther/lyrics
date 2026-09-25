import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ApiError, apiGet } from "../api/client";
import { Button } from "../components/ui/Button";
import type { ArtistDashboardStats } from "../features/artist/types";

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-zinc-800 py-3 last:border-0">
      <span className="text-zinc-300">{label}</span>
      <span className="text-xl font-semibold tabular-nums text-violet-400">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function ArtistDashboardPage() {
  const dashboard = useQuery({
    queryKey: ["artist", "dashboard"],
    queryFn: () =>
      apiGet<{ stats: ArtistDashboardStats }>("/api/v1/artists/me/dashboard"),
    retry: (count, err) =>
      !(err instanceof ApiError && err.code === "NO_ARTIST_PROFILE") && count < 2,
  });

  if (
    dashboard.error instanceof ApiError &&
    dashboard.error.code === "NO_ARTIST_PROFILE"
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Artist dashboard</h1>
        <p className="text-zinc-400">Create your artist profile to see stats and upload songs.</p>
        <Link to="/artist/profile">
          <Button type="button">Set up profile</Button>
        </Link>
      </div>
    );
  }

  const stats = dashboard.data?.stats;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Artist dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/artist/songs/new">
            <Button type="button">Add song</Button>
          </Link>
          <Link to="/artist/videos/new">
            <Button type="button" variant="ghost">
              Create lyrics video
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-2">
        {dashboard.isLoading && (
          <p className="py-4 text-sm text-zinc-500">Loading stats…</p>
        )}
        {stats && (
          <>
            <StatRow label="Songs" value={stats.songs} />
            <StatRow label="Albums" value={stats.albums} />
            <StatRow label="Lyrics" value={stats.lyrics} />
            <StatRow label="Videos" value={stats.videos} />
            <StatRow label="Views" value={stats.views} />
          </>
        )}
      </div>

      <nav className="grid gap-3 sm:grid-cols-2">
        {[
          { to: "/artist/songs/new", label: "My Songs", hint: "Upload tracks & open lyrics editor" },
          { to: "/artist/dashboard", label: "My Albums", hint: "Coming soon" },
          { to: "/artist/dashboard", label: "My Lyrics", hint: "Coming soon" },
          { to: "/artist/videos/new", label: "My Videos", hint: "Lyrics video projects & render" },
          { to: "/artist/songs/music-video", label: "Upload music video", hint: "MP4 → extract audio → overlay lyrics" },
          { to: "/artist/analytics", label: "Analytics", hint: "Views, plays, downloads" },
          { to: "/artist/verify", label: "Verified artist", hint: "Request verification badge" },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:border-violet-500/40"
          >
            <p className="font-medium text-zinc-100">{item.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{item.hint}</p>
          </Link>
        ))}
      </nav>

      <Link to="/artist/profile" className="text-sm text-violet-400 hover:underline">
        Edit artist profile
      </Link>
    </div>
  );
}
