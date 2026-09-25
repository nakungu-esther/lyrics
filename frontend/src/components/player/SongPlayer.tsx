import { useEffect, useRef, useState } from "react";
import { formatTime } from "../../lib/time";
import { Button } from "../ui/Button";
import { HubIcon } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";

type Props = {
  audioUrl: string | null | undefined;
  durationSeconds?: number | null;
  onTimeUpdate?: (t: number) => void;
  onPlayStart?: () => void;
};

export function SongPlayer({ audioUrl, durationSeconds, onTimeUpdate, onPlayStart }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);

  useEffect(() => {
    if (durationSeconds) setDuration(durationSeconds);
  }, [durationSeconds]);

  if (!audioUrl) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
        <HubIcon name="audio" size={ICON_SIZE.lg} className="text-zinc-600" />
        No audio available
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <p className="text-center text-xs uppercase tracking-widest text-zinc-500">Song player</p>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          const t = audioRef.current?.currentTime ?? 0;
          setCurrent(t);
          onTimeUpdate?.(t);
        }}
        onLoadedMetadata={() => {
          const d = audioRef.current?.duration;
          if (d && Number.isFinite(d)) setDuration(d);
        }}
        onEnded={() => setPlaying(false)}
      />
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          leadingIcon={playing ? "pause" : "play"}
          onClick={() => {
            const el = audioRef.current;
            if (!el) return;
            if (playing) {
              el.pause();
            } else {
              onPlayStart?.();
              void el.play();
            }
            setPlaying(!playing);
          }}
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <span className="tabular-nums text-zinc-300">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
