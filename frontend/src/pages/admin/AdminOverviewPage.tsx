import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import { HubIcon } from "../../components/icons/HubIcon";
import { StatCard } from "../../components/ui/StatCard";

const ACTIVITY_PREVIEW = [
  { text: "New song uploaded", time: "2 min ago", icon: "songs" as const },
  { text: "New artist verified", time: "18 min ago", icon: "verified" as const },
  { text: "User registered", time: "1 hr ago", icon: "users" as const },
  { text: "Report opened", time: "3 hr ago", icon: "alert" as const },
];

export function AdminOverviewPage() {
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () =>
      apiGet<{
        stats: {
          users: number;
          artists: number;
          songs: number;
          openReports: number;
          pendingVerifications: number;
          templates: number;
        };
      }>("/api/v1/admin/overview"),
  });

  const s = overview.data?.stats;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
        <p className="mt-1 text-sm text-slate-400">System performance and key metrics.</p>
      </div>

      {overview.isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {s && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={s.users} icon="users" />
            <StatCard label="Total Artists" value={s.artists} icon="artist" />
            <StatCard label="Total Songs" value={s.songs} icon="songs" />
            <StatCard label="Total Videos" value={s.templates} icon="templates" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="hub-card rounded-xl p-6 lg:col-span-2">
              <h3 className="font-semibold text-white">Platform Growth</h3>
              <div className="mt-6 flex h-44 items-end justify-between gap-2 border-b border-slate-700/50 pb-2">
                {[35, 42, 40, 58, 52, 70, 78, 85].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full max-w-8 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400/70"
                      style={{ height: `${h}%` }}
                      aria-hidden
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 flex gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Users
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-violet-500" /> Artists
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> Songs
                </span>
              </p>
            </section>

            <section className="hub-card rounded-xl p-6">
              <h3 className="font-semibold text-white">System Health</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {["API", "Database", "Media processing", "Storage"].map((name) => (
                  <li key={name} className="flex items-center justify-between text-slate-300">
                    <span>{name}</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Online
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="hub-card rounded-xl p-6">
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <ul className="mt-4 space-y-3">
                {ACTIVITY_PREVIEW.map((a) => (
                  <li key={a.text} className="flex items-start gap-3 text-sm">
                    <HubIcon name={a.icon} size={16} className="mt-0.5 text-slate-500" />
                    <div>
                      <p className="text-slate-200">{a.text}</p>
                      <p className="text-xs text-slate-500">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="hub-card rounded-xl p-6">
              <h3 className="font-semibold text-white">Needs attention</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex justify-between">
                  <span>Open reports</span>
                  <Link to="/admin/reports" className="text-indigo-400 hover:underline">
                    {s.openReports}
                  </Link>
                </li>
                <li className="flex justify-between">
                  <span>Pending verifications</span>
                  <Link to="/admin/verification" className="text-indigo-400 hover:underline">
                    {s.pendingVerifications}
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
