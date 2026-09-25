import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchArtistDashboard } from "../../api/artists";
import { VerificationBadge } from "../../components/artist/VerificationBadge";
import { QuickActionCard } from "../../components/ui/QuickActionCard";
import { StatCard } from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { HubIcon } from "../../components/icons/HubIcon";
import { artistKeys } from "../../features/artist/queryKeys";
import { useMyArtist } from "../../features/artist/useMyArtist";

function VerificationBanner() {
  const { data: artist } = useMyArtist();
  if (!artist?.verification) return null;
  const { status, rejectionNote } = artist.verification;
  if (status === "VERIFIED" || artist.isVerified) {
    return (
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        Your artist profile is verified.
      </p>
    );
  }
  if (status === "REJECTED") {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        <p>Verification was rejected.</p>
        {rejectionNote && <p className="mt-2 text-red-200/80">{rejectionNote}</p>}
      </div>
    );
  }
  return (
    <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      Your artist profile is awaiting verification.
    </p>
  );
}

export function ArtistDashboardOverviewPage() {
  const { data: artist } = useMyArtist();
  const dashboard = useQuery({
    queryKey: artistKeys.dashboard,
    queryFn: fetchArtistDashboard,
  });

  const stats = dashboard.data?.stats ?? {
    songs: 0,
    albums: 0,
    lyrics: 0,
    videos: 0,
    views: 0,
  };

  const firstName = artist?.name?.split(/\s+/)[0] ?? "Artist";

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {firstName}!</h1>
        <p className="mt-2 text-slate-400">Artist dashboard · manage songs, lyrics, and videos.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {artist && (
          <VerificationBadge isVerified={artist.isVerified} status={artist.verification?.status} />
        )}
      </div>

      <VerificationBanner />

      {dashboard.isError && <p className="text-sm text-amber-400">Could not load statistics.</p>}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Songs" value={stats.songs} href="/artist/songs" icon="songs" />
            <StatCard label="Total Views" value={stats.views} href="/artist/analytics" icon="eye" />
            <StatCard label="Total Plays" value={stats.views} href="/artist/analytics" icon="play" />
            <StatCard label="Followers" value={0} icon="heart" />
          </div>

          <Card>
            <h2 className="font-semibold text-white">Recent songs</h2>
            <ul className="mt-4 space-y-3">
              {stats.songs === 0 ? (
                <li className="text-sm text-slate-500">
                  No songs yet.{" "}
                  <Link to="/artist/songs/new" className="text-blue-400 hover:underline">
                    Upload song
                  </Link>
                </li>
              ) : (
                <li className="flex items-center gap-3 rounded-lg border border-slate-700/60 p-3">
                  <div className="h-12 w-12 rounded-lg bg-slate-700" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200">Your catalog</p>
                    <p className="text-xs text-slate-500">{stats.songs} songs</p>
                  </div>
                  <Badge tone="success">Published</Badge>
                </li>
              )}
            </ul>
            <Link to="/artist/songs" className="mt-4 inline-block text-sm text-blue-400 hover:underline">
              Manage all songs →
            </Link>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <h2 className="font-semibold text-white">Quick links</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Upload Song", to: "/artist/songs/new", icon: "upload" as const },
                { label: "Create Video", to: "/create", icon: "videos" as const },
                { label: "Manage Albums", to: "/artist/albums", icon: "albums" as const },
                { label: "View Analytics", to: "/artist/analytics", icon: "analytics" as const },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <HubIcon name={item.icon} size={16} className="text-indigo-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-2xl font-bold text-white">
              {artist?.name?.charAt(0) ?? "A"}
            </div>
            <p className="mt-3 font-semibold text-white">{artist?.name ?? "Artist"}</p>
            <p className="text-xs text-slate-500">@{artist?.slug ?? "profile"}</p>
            <Link to="/artist/profile" className="mt-4 inline-block">
              <Button type="button" variant="secondary" size="sm">
                View Profile
              </Button>
            </Link>
          </Card>
        </aside>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:hidden">
        <QuickActionCard title="Upload song" description="" href="/artist/songs/new" icon="upload" />
        <QuickActionCard title="Create video" description="" href="/create" icon="sparkles" />
        <QuickActionCard title="Analytics" description="" href="/artist/analytics" icon="analytics" />
      </div>
    </div>
  );
}
