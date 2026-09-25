import { useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import { fetchGenresCatalog } from "../api/genres";
import { HubIcon } from "../components/icons/HubIcon";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GOSPEL_SUBGENRES, SONG_GENRES } from "../lib/genreCatalog";

type SearchResult = {
  results: {
    songs: { id: string; title: string; artist: { name: string; slug: string } }[];
    artists: { slug: string; name: string }[];
    albums: { id: string; title: string; artist: { name: string } }[];
    lyrics: { id: string; text: string; song: { id: string; title: string; artist: { name: string } } }[];
  };
};

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [language, setLanguage] = useState(params.get("language") ?? "");
  const [genre, setGenre] = useState(params.get("genre") ?? "");
  const [subgenre, setSubgenre] = useState(params.get("subgenre") ?? "");
  const [year, setYear] = useState(params.get("year") ?? "");
  const [artist, setArtist] = useState(params.get("artist") ?? "");

  const genresCatalog = useQuery({
    queryKey: ["genres-catalog"],
    queryFn: fetchGenresCatalog,
    staleTime: 60_000,
  });

  const queryString = params.toString();

  const search = useQuery({
    queryKey: ["search", queryString],
    queryFn: () => {
      const qs = new URLSearchParams(params);
      return apiGet<SearchResult>(`/api/v1/search?${qs.toString()}`);
    },
    enabled: queryString.length > 0,
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (language.trim()) next.set("language", language.trim());
    if (genre.trim()) next.set("genre", genre.trim());
    if (subgenre.trim()) next.set("subgenre", subgenre.trim());
    if (year.trim()) next.set("year", year.trim());
    if (artist.trim()) next.set("artist", artist.trim());
    setParams(next);
  }

  const r = search.data?.results;

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <HubIcon name="search" size={24} className="text-indigo-400" />
        Search
      </h1>
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder='e.g. "Luganda love"'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:col-span-2"
        />
        <Input
          placeholder="Language code (lg, sw…)"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            if (e.target.value !== "Gospel") setSubgenre("");
          }}
        >
          <option value="">Any genre</option>
          {(genresCatalog.data?.genres ?? SONG_GENRES).map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        {genre === "Gospel" && (
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={subgenre}
            onChange={(e) => setSubgenre(e.target.value)}
          >
            <option value="">Any Gospel style</option>
            {(genresCatalog.data?.gospelSubgenres ?? GOSPEL_SUBGENRES).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <Input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
        <Input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <Button type="submit" className="sm:col-span-2" leadingIcon="search">
          Search
        </Button>
      </form>

      {search.isFetching && <p className="text-sm text-zinc-500">Searching…</p>}

      {r && (
        <div className="space-y-8">
          {r.songs.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
                <HubIcon name="songs" size={18} className="text-zinc-500" />
                Songs
              </h2>
              <ul className="space-y-2">
                {r.songs.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/songs/${s.id}`}
                      className="inline-flex items-center gap-2 text-violet-400 hover:underline"
                    >
                      <HubIcon name="songs" size={16} className="shrink-0 opacity-80" />
                      {s.title} — {s.artist.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {r.artists.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
                <HubIcon name="artist" size={18} className="text-zinc-500" />
                Artists
              </h2>
              <ul className="space-y-2">
                {r.artists.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={`/artists/${a.slug}`}
                      className="inline-flex items-center gap-2 text-violet-400 hover:underline"
                    >
                      <HubIcon name="artist" size={16} className="shrink-0 opacity-80" />
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {r.albums.length > 0 && (
            <section>
              <h2 className="text-lg font-medium mb-3">Albums</h2>
              <ul className="space-y-2">
                {r.albums.map((a) => (
                  <li key={a.id}>
                    <span className="inline-flex items-center gap-2 text-zinc-300">
                      <HubIcon name="albums" size={16} className="shrink-0 opacity-80" />
                      {a.title} — {a.artist.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {r.lyrics.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
                <HubIcon name="lyrics" size={18} className="text-zinc-500" />
                Lyrics
              </h2>
              <ul className="space-y-2">
                {r.lyrics.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/songs/${l.song.id}`}
                      className="inline-flex items-start gap-2 text-violet-400 hover:underline"
                    >
                      <HubIcon name="lyrics" size={16} className="mt-0.5 shrink-0 opacity-80" />
                      <span>
                        {l.text.slice(0, 80)}… — {l.song.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
