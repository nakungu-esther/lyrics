import { Link } from "react-router-dom";
import type { Song } from "../../features/songs/types";
import { languageMeta } from "../../lib/languageDisplay";

type Props = {
  song: Song;
};

export function SongLanguageSection({ song }: Props) {
  const detected = song.detectedLanguageCode
    ? languageMeta(song.detectedLanguageCode)
    : null;
  const confirmed = song.primaryLanguageCode
    ? languageMeta(song.primaryLanguageCode)
    : null;

  let body = "Not detected";
  if (song.languageState === "CONFIRMED" && song.languageConfirmed && confirmed) {
    body = `${confirmed.name} — confirmed by artist`;
  } else if (song.languageState === "CONFIRMATION_REQUIRED" && detected) {
    body = `${detected.name} — please confirm language`;
  } else if (detected && song.languageConfidence != null) {
    const pct = Math.round(song.languageConfidence * 100);
    body = `${detected.name} — ${pct}% confidence (please confirm before transcription)`;
  } else if (song.languageState === "NOT_DETECTED" && song.media?.audio?.processed) {
    body = "Detecting…";
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-200">Language</h3>
        <Link
          to={`/artist/songs/${song.id}/language`}
          className="text-xs text-violet-400 hover:underline"
        >
          Review &amp; confirm
        </Link>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </div>
  );
}
