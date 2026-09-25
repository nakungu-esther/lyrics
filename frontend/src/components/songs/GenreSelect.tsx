import { useQuery } from "@tanstack/react-query";
import { fetchGenresCatalog } from "../../api/genres";
import { GOSPEL_SUBGENRES, SONG_GENRES } from "../../lib/genreCatalog";

type Props = {
  genre: string;
  subgenre: string;
  onChange: (patch: { genre?: string; subgenre?: string }) => void;
};

export function GenreSelect({ genre, subgenre, onChange }: Props) {
  const catalogQuery = useQuery({
    queryKey: ["genres-catalog"],
    queryFn: fetchGenresCatalog,
    staleTime: 60_000,
  });

  const genres = catalogQuery.data?.genres ?? [...SONG_GENRES];
  const gospelSubgenres = catalogQuery.data?.gospelSubgenres ?? [...GOSPEL_SUBGENRES];
  const isGospel = genre === "Gospel";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-1 sm:col-span-2">
        <span className="text-sm text-zinc-400">Genre</span>
        <select
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={genre}
          onChange={(e) => {
            const next = e.target.value;
            onChange({
              genre: next,
              subgenre: next === "Gospel" ? subgenre : "",
            });
          }}
        >
          <option value="">Select genre…</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500">
          Genre is separate from language (e.g. Gospel song in Luganda or English).
        </p>
      </label>
      {isGospel && (
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-sm text-zinc-400">Gospel style (optional)</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={subgenre}
            onChange={(e) => onChange({ subgenre: e.target.value })}
          >
            <option value="">General Gospel</option>
            {gospelSubgenres.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
