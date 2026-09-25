import { useEffect, useRef } from "react";
import type { VideoCustomization } from "../../features/video/types";

type Props = {
  style: VideoCustomization;
  videoUrl?: string | null;
  audioUrl?: string | null;
  aspect?: "16/9" | "9/16" | "1/1" | "4/3";
  sampleLine?: string;
  sampleHighlight?: string;
};

export function StudioLivePreview({
  style,
  videoUrl,
  audioUrl,
  aspect = "16/9",
  sampleLine = "Nze nkuyagala",
  sampleHighlight = "nnyo",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    v.src = videoUrl;
    v.load();
  }, [videoUrl]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !audioUrl || videoUrl) return;
    a.src = audioUrl;
    a.load();
  }, [audioUrl, videoUrl]);

  const justify =
    style.position === "top"
      ? "justify-start pt-[8%]"
      : style.position === "center"
        ? "justify-center"
        : "justify-end pb-[8%]";

  const aspectClass =
    aspect === "9/16"
      ? "aspect-[9/16] max-w-sm"
      : aspect === "1/1"
        ? "aspect-square max-w-md"
        : aspect === "4/3"
          ? "aspect-[4/3] max-w-2xl"
          : "aspect-video max-w-2xl";

  const showVideoBg = style.background.type === "video" && videoUrl;

  const solidBg =
    style.background.type === "solid"
      ? style.background.color ?? "#0a0a0a"
      : style.background.type === "gradient"
        ? "linear-gradient(160deg,#1e1b4b,#0f172a)"
        : "#0a0a0a";

  const textShadow = (style as VideoCustomization & { textShadow?: string }).textShadow;

  return (
    <div className={`relative mx-auto w-full overflow-hidden rounded-xl border border-zinc-700 ${aspectClass}`}>
      {showVideoBg ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          loop
          autoPlay
          controls
        />
      ) : (
        <div className="absolute inset-0" style={{ background: solidBg }} />
      )}
      {!showVideoBg && videoUrl && (
        <video ref={videoRef} className="hidden" playsInline muted loop autoPlay controls />
      )}
      {audioUrl && !showVideoBg && (
        <audio ref={audioRef} controls className="absolute bottom-2 left-2 right-2 z-20 w-[calc(100%-1rem)] opacity-90" />
      )}

      <div
        className={`relative z-10 flex h-full flex-col items-center px-6 text-center ${justify}`}
      >
        <p
          style={{
            fontFamily: style.fontFamily,
            fontSize: Math.min(style.fontSize, 42),
            color: style.textColor,
            textShadow: textShadow ?? "0 2px 12px rgba(0,0,0,0.65)",
            lineHeight: 1.35,
          }}
        >
          {sampleLine}{" "}
          <span style={{ color: style.highlightColor }}>{sampleHighlight}</span>
        </p>
      </div>
    </div>
  );
}
