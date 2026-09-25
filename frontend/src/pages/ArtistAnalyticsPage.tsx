import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client";

type Stats = {
  totals: {
    songViews: number;
    audioPlays: number;
    lyricsViews: number;
    videoViews: number;
    downloads: number;
  };
  popularSongs: { songId: string; title: string; views: number }[];
};

export function ArtistAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiGet<{ stats: Stats }>("/api/v1/analytics/artist/me"),
  });

  const t = data?.stats.totals;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Artist analytics</h1>
      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
      {t && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Song views", t.songViews],
            ["Audio plays", t.audioPlays],
            ["Lyrics views", t.lyricsViews],
            ["Video views", t.videoViews],
            ["Downloads", t.downloads],
          ].map(([label, val]) => (
            <div key={label as string} className="rounded-lg border border-zinc-800 p-4">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="text-2xl font-semibold text-violet-400">{(val as number).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      {data?.stats.popularSongs.length ? (
        <section>
          <h2 className="text-lg font-medium mb-3">Popular songs</h2>
          <ul className="space-y-2">
            {data.stats.popularSongs.map((s) => (
              <li key={s.songId}>
                <Link to={`/songs/${s.songId}`} className="text-violet-400 hover:underline">
                  {s.title} ({s.views} views)
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <p className="text-xs text-zinc-600">Daily / weekly / monthly breakdowns — coming soon.</p>
      <Link to="/artist/dashboard" className="text-sm text-violet-400 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
