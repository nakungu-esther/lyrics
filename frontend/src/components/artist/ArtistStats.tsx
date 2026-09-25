import type { ArtistDashboardStats } from "../../features/artist/types";

export function ArtistStats({ stats }: { stats: ArtistDashboardStats }) {
  const rows = [
    { label: "Total Songs", value: stats.songs },
    { label: "Total Albums", value: stats.albums },
    { label: "Total Lyrics", value: stats.lyrics },
    { label: "Total Views", value: stats.views },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
        >
          <p className="text-sm text-zinc-500">{row.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-violet-400">
            {row.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
