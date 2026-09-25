import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  confirmSongLanguage,
  fetchLanguages,
  fetchSongLanguage,
  retryLanguageDetection,
} from "../api/language";
import { Button } from "../components/ui/Button";
import { UploadError } from "../components/songs/UploadError";
import { UploadProgress } from "../components/songs/UploadProgress";
import { songKeys } from "../features/songs/queryKeys";

export function SongLanguagePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [changing, setChanging] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const languageQuery = useQuery({
    queryKey: ["song-language", id],
    queryFn: () => fetchSongLanguage(id!),
    enabled: Boolean(id),
    refetchInterval: (q) => {
      const job = q.state.data?.processingJob;
      if (job?.status === "QUEUED" || job?.status === "PROCESSING") return 2000;
      if (!q.state.data?.detected.languageCode && q.state.data?.languageState === "NOT_DETECTED") {
        return 2000;
      }
      return false;
    },
  });

  const languagesQuery = useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });

  const status = languageQuery.data;
  const detected = status?.detected;
  const activeCode =
    selectedCode ?? detected?.languageCode ?? status?.confirmed.languageCode ?? "lg";

  const filteredLanguages = useMemo(() => {
    const list = languagesQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
    );
  }, [languagesQuery.data, search]);

  const confirm = useMutation({
    mutationFn: (code: string) => confirmSongLanguage(id!, { languages: [code] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["song-language", id] });
      void queryClient.invalidateQueries({ queryKey: songKeys.detail(id!) });
      setChanging(false);
    },
  });

  const retry = useMutation({
    mutationFn: () => retryLanguageDetection(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["song-language", id] });
    },
  });

  if (!id) return null;

  const job = status?.processingJob;
  const detecting =
    job?.status === "QUEUED" ||
    job?.status === "PROCESSING" ||
    (status?.languageState === "NOT_DETECTED" && !detected?.languageCode);

  const lowConfidence =
    status?.languageState === "CONFIRMATION_REQUIRED" ||
    (detected?.confidence != null && detected.confidence < 0.75);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link to={`/artist/songs/${id}`} className="text-sm text-violet-400 hover:underline">
          ← Back to song
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Language detection</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Confirm the detected language before transcription. AI suggestions are not guaranteed to
          be correct.
        </p>
      </div>

      {detecting && (
        <div className="space-y-2">
          <p className="text-sm text-zinc-300">Analyzing audio for language…</p>
          <UploadProgress
            label="Language detection"
            progress={job?.progress ?? 15}
            state="uploading"
          />
        </div>
      )}

      {job?.status === "FAILED" && (
        <UploadError
          message={job.error ?? "Language detection failed."}
          onRetry={() => retry.mutate()}
        />
      )}

      {status?.languageState === "CONFIRMED" && status.confirmed.languageName && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-6">
          <p className="text-sm text-emerald-200/80">Confirmed language</p>
          <p className="text-2xl font-semibold text-emerald-100">
            {status.confirmed.languageName}
          </p>
          <p className="mt-2 text-sm text-emerald-200/70">Ready for transcription (Step 10).</p>
        </div>
      )}

      {detected?.languageName && status?.languageState !== "CONFIRMED" && !detecting && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div>
            <p className="text-sm text-zinc-400">Detected language</p>
            <p className="text-2xl font-semibold">
              {detected.languageName}{" "}
              {detected.languageCode && (
                <span className="text-base font-normal text-zinc-500">
                  ({detected.languageCode.toUpperCase()})
                </span>
              )}
            </p>
            {detected.confidence != null && (
              <p className="mt-2 text-zinc-300">
                Confidence:{" "}
                <span className="text-violet-400">
                  {Math.round(detected.confidence * 100)}%
                </span>
              </p>
            )}
            <p className="mt-3 text-sm text-zinc-500">
              Please confirm that this is correct before transcription.
            </p>
            {lowConfidence && (
              <p className="mt-2 text-sm text-amber-300/90">
                We couldn&apos;t confidently identify the language. Choose manually if needed.
              </p>
            )}
          </div>

          {(status?.segments.ai.length ?? 0) > 1 && (
            <div>
              <p className="text-sm font-medium text-zinc-300">Detected languages (segments)</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                {status!.segments.ai.map((seg) => (
                  <li key={seg.id}>
                    {seg.languageName} ({seg.startTime.toFixed(0)}s – {seg.endTime.toFixed(0)}s)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!changing && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={confirm.isPending || !detected.languageCode}
                onClick={() => {
                  if (detected.languageCode) void confirm.mutateAsync(detected.languageCode);
                }}
              >
                Confirm {detected.languageName}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setChanging(true)}>
                Change language
              </Button>
            </div>
          )}
        </div>
      )}

      {changing && (
        <div className="space-y-4 rounded-xl border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400">Search and select language</p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          />
          <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={`rounded-lg border px-4 py-3 text-left text-sm ${
                  activeCode === lang.code
                    ? "border-violet-500 bg-violet-950/30"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
                onClick={() => setSelectedCode(lang.code)}
              >
                {lang.name}{" "}
                <span className="text-zinc-500">({lang.code.toUpperCase()})</span>
              </button>
            ))}
          </div>
          <Button
            type="button"
            disabled={confirm.isPending}
            onClick={() => void confirm.mutateAsync(activeCode)}
          >
            Confirm selection
          </Button>
        </div>
      )}

      {status?.aiHistory[0] && status.languageState !== "CONFIRMED" && (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer">AI detection history</summary>
          <p className="mt-2">
            Latest AI result: {status.aiHistory[0].languageName} (
            {Math.round(status.aiHistory[0].confidence * 100)}%) — preserved even if you override.
          </p>
        </details>
      )}
    </div>
  );
}
