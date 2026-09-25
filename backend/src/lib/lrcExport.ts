type LineLike = {
  text: string;
  sortOrder: number;
  startTime: number | null | undefined;
  endTime?: number | null;
};

type SectionLike = {
  sortOrder: number;
  lines: LineLike[];
};

export type LrcExportMeta = {
  title?: string;
  artist?: string;
  enhanced?: boolean;
};

function formatLrcTimestamp(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `[${String(m).padStart(2, "0")}:${sec.toFixed(2).padStart(5, "0")}]`;
}

function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_") || "lyrics.lrc";
}

/** Standard line LRC; optional enhanced header when word timings exist on lines. */
export function buildLrcContent(
  sections: SectionLike[],
  meta: LrcExportMeta = {},
): string {
  const lines: string[] = [];
  if (meta.title?.trim()) lines.push(`[ti:${meta.title.trim()}]`);
  if (meta.artist?.trim()) lines.push(`[ar:${meta.artist.trim()}]`);
  lines.push("[by:LyricsHub]");
  if (meta.enhanced) lines.push("[enhanced:true]");
  lines.push("");

  const flat = sections
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((sec) =>
      sec.lines
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((ln) => ln.text.trim().length > 0),
    );

  for (const ln of flat) {
    const start = ln.startTime;
    if (start == null || Number.isNaN(start)) continue;
    lines.push(`${formatLrcTimestamp(start)}${ln.text.trim()}`);
  }

  return lines.join("\n");
}

export function lrcDownloadFilename(meta: LrcExportMeta): string {
  const { title, artist } = meta;
  if (title?.trim() && artist?.trim()) {
    return safeFilename(`${artist.trim()} - ${title.trim()}.lrc`);
  }
  return "lyrics.lrc";
}
