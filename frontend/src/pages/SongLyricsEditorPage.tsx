import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiDownload, apiGet, apiPatch, apiPost } from "../api/client";
import { SongPlayer } from "../components/player/SongPlayer";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { formatTime, parseTimeInput } from "../lib/time";

type Word = {
  id?: string;
  text: string;
  sortOrder: number;
  startTime: number;
  endTime: number;
};

type Line = {
  id?: string;
  text: string;
  sortOrder: number;
  startTime?: number | null;
  endTime?: number | null;
  words?: Word[];
};

type Section = {
  id?: string;
  label?: string;
  sectionType?: string;
  sortOrder: number;
  lines: Line[];
};

type LyricsPayload = {
  song: { id: string; title: string; audioUrl: string | null; durationSeconds: number | null };
  lyrics: {
    id: string;
    status: string;
    sections: (Section & { lines: (Line & { words: Word[] })[] })[];
  } | null;
};

function toEditorPayload(sections: Section[]) {
  return { sections };
}

export function SongLyricsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [syncMode, setSyncMode] = useState<"line" | "word">("line");
  const [sections, setSections] = useState<Section[]>([]);
  const [initialized, setInitialized] = useState(false);

  const data = useQuery({
    queryKey: ["lyrics", id],
    queryFn: () => apiGet<LyricsPayload>(`/api/v1/lyrics/song/${id}`),
    enabled: Boolean(id),
    refetchInterval: (q) => (q.state.data?.lyrics ? false : 3000),
  });

  const song = data.data?.song;
  const lyrics = data.data?.lyrics;

  useEffect(() => {
    if (!lyrics || initialized) return;
    setSections(
      lyrics.sections.map((s) => ({
        id: s.id,
        label: s.label ?? undefined,
        sectionType: s.sectionType,
        sortOrder: s.sortOrder,
        lines: s.lines.map((l) => ({
          id: l.id,
          text: l.text,
          sortOrder: l.sortOrder,
          startTime: l.startTime,
          endTime: l.endTime,
          words: l.words?.map((w) => ({ ...w })),
        })),
      })),
    );
    setInitialized(true);
  }, [lyrics, initialized]);

  const saveDraft = useMutation({
    mutationFn: () =>
      apiPatch(`/api/v1/lyrics/${lyrics!.id}/draft`, toEditorPayload(sections)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lyrics", id] }),
  });

  const save = useMutation({
    mutationFn: () =>
      apiPatch(`/api/v1/lyrics/${lyrics!.id}`, toEditorPayload(sections)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lyrics", id] }),
  });

  const approve = useMutation({
    mutationFn: () => apiPost(`/api/v1/lyrics/${lyrics!.id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lyrics", id] }),
  });

  const transcribe = useMutation({
    mutationFn: () => apiPost<{ jobId: string }>(`/api/v1/lyrics/song/${id}/transcribe`),
    onSuccess: () => {
      setInitialized(false);
      void queryClient.invalidateQueries({ queryKey: ["lyrics", id] });
    },
  });

  const statusLabel = useMemo(() => {
    switch (lyrics?.status) {
      case "AI_GENERATED":
        return "AI generated (not published)";
      case "ARTIST_EDITED":
        return "Artist edited";
      case "ARTIST_VERIFIED":
        return "✓ Official lyrics — verified by artist";
      default:
        return lyrics?.status ?? "No lyrics yet";
    }
  }, [lyrics?.status]);

  function updateLine(sectionIdx: number, lineIdx: number, patch: Partial<Line>) {
    setSections((prev) =>
      prev.map((sec, si) =>
        si !== sectionIdx
          ? sec
          : {
              ...sec,
              lines: sec.lines.map((ln, li) =>
                li !== lineIdx ? ln : { ...ln, ...patch },
              ),
            },
      ),
    );
  }

  if (!id) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Lyrics editor</h1>
          <p className="mt-1 text-sm text-zinc-400">{song?.title}</p>
          <p className="mt-2 text-sm text-emerald-400/90">{statusLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSyncMode(syncMode === "line" ? "word" : "line")}
          >
            {syncMode === "line" ? "Word sync" : "Line sync"}
          </Button>
          <Link to={`/artist/songs/${id}/language`}>
            <Button type="button" variant="ghost">
              Language
            </Button>
          </Link>
          <Link to="/lrc-studio">
            <Button type="button" variant="ghost">
              Nyimba LRC (new upload)
            </Button>
          </Link>
        </div>
      </div>

      <SongPlayer audioUrl={song?.audioUrl} durationSeconds={song?.durationSeconds} />

      {!lyrics && (
        <div className="space-y-3 rounded-lg border border-violet-500/30 bg-violet-950/20 p-4 text-sm">
          <p className="text-violet-200">
            Waiting for AI transcription… Confirm language first, then run transcription (needs{" "}
            <code className="text-violet-100">npm run dev:worker</code>).
          </p>
          <Button
            type="button"
            variant="ghost"
            disabled={transcribe.isPending}
            onClick={() => void transcribe.mutate()}
          >
            {transcribe.isPending ? "Starting…" : "Run AI transcription"}
          </Button>
        </div>
      )}

      {lyrics && (
        <>
          <div className="space-y-8">
            {sections.map((section, si) => (
              <div key={section.id ?? si} className="space-y-3">
                <Input
                  className="font-semibold uppercase tracking-wide"
                  value={section.label ?? ""}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((s, i) =>
                        i === si ? { ...s, label: e.target.value } : s,
                      ),
                    )
                  }
                  placeholder="VERSE 1"
                />
                {section.lines.map((line, li) => (
                  <div
                    key={line.id ?? li}
                    className="rounded-lg border border-zinc-800 p-4 space-y-2"
                  >
                    <Input
                      value={line.text}
                      onChange={(e) => updateLine(si, li, { text: e.target.value })}
                    />
                    {syncMode === "line" && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <span className="text-zinc-500">Start</span>
                          <Input
                            className="w-28"
                            defaultValue={formatTime(line.startTime ?? undefined)}
                            onBlur={(e) =>
                              updateLine(si, li, {
                                startTime: parseTimeInput(e.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="text-zinc-500">End</span>
                          <Input
                            className="w-28"
                            defaultValue={formatTime(line.endTime ?? undefined)}
                            onBlur={(e) =>
                              updateLine(si, li, {
                                endTime: parseTimeInput(e.target.value),
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                    {syncMode === "word" && (
                      <div className="space-y-2 pl-2 border-l border-zinc-800">
                        {(line.words ?? []).map((w, wi) => (
                          <div key={w.id ?? wi} className="flex flex-wrap gap-2 items-center">
                            <Input
                              className="w-32"
                              value={w.text}
                              onChange={(e) =>
                                setSections((prev) =>
                                  prev.map((sec, sii) =>
                                    sii !== si
                                      ? sec
                                      : {
                                          ...sec,
                                          lines: sec.lines.map((ln, lii) =>
                                            lii !== li
                                              ? ln
                                              : {
                                                  ...ln,
                                                  words: (ln.words ?? []).map((ww, wii) =>
                                                    wii !== wi
                                                      ? ww
                                                      : { ...ww, text: e.target.value },
                                                  ),
                                                },
                                          ),
                                        },
                                  ),
                                )
                              }
                            />
                            <Input
                              className="w-24 text-xs"
                              defaultValue={formatTime(w.startTime)}
                              onBlur={(e) => {
                                const t = parseTimeInput(e.target.value);
                                if (t == null) return;
                                setSections((prev) =>
                                  prev.map((sec, sii) =>
                                    sii !== si
                                      ? sec
                                      : {
                                          ...sec,
                                          lines: sec.lines.map((ln, lii) =>
                                            lii !== li
                                              ? ln
                                              : {
                                                  ...ln,
                                                  words: (ln.words ?? []).map((ww, wii) =>
                                                    wii !== wi ? ww : { ...ww, startTime: t },
                                                  ),
                                                },
                                          ),
                                        },
                                  ),
                                );
                              }}
                            />
                            <span className="text-zinc-600">→</span>
                            <Input
                              className="w-24 text-xs"
                              defaultValue={formatTime(w.endTime)}
                              onBlur={(e) => {
                                const t = parseTimeInput(e.target.value);
                                if (t == null) return;
                                setSections((prev) =>
                                  prev.map((sec, sii) =>
                                    sii !== si
                                      ? sec
                                      : {
                                          ...sec,
                                          lines: sec.lines.map((ln, lii) =>
                                            lii !== li
                                              ? ln
                                              : {
                                                  ...ln,
                                                  words: (ln.words ?? []).map((ww, wii) =>
                                                    wii !== wi ? ww : { ...ww, endTime: t },
                                                  ),
                                                },
                                          ),
                                        },
                                  ),
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={saveDraft.isPending}
              onClick={() => void saveDraft.mutate()}
            >
              Save draft
            </Button>
            <Button type="button" disabled={save.isPending} onClick={() => void save.mutate()}>
              Save
            </Button>
            <Button
              type="button"
              disabled={approve.isPending || lyrics.status === "ARTIST_VERIFIED"}
              onClick={() => void approve.mutate()}
            >
              Approve lyrics
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                void apiDownload(
                  `/api/v1/lyrics/song/${id}/export.lrc`,
                  `${song?.title ?? "lyrics"}.lrc`,
                )
              }
            >
              Download LRC
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={transcribe.isPending}
              onClick={() => void transcribe.mutate()}
            >
              Retry transcription
            </Button>
            {lyrics.status === "ARTIST_VERIFIED" && (
              <Link to={`/songs/${id}`}>
                <Button type="button" variant="ghost">
                  View public page
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
