import type { VideoCustomization } from "../../features/video/types";

type Props = {
  style: VideoCustomization;
  sampleLine?: string;
  sampleLine2?: string;
};

export function VideoPreview({
  style,
  sampleLine = "Nze nkuyagala",
  sampleLine2 = "nnyo",
}: Props) {
  const justify =
    style.position === "top"
      ? "justify-start pt-8"
      : style.position === "center"
        ? "justify-center"
        : "justify-end pb-8";

  const bg =
    style.background.type === "solid"
      ? style.background.color ?? "#0a0a0a"
      : style.background.type === "video"
        ? "#000"
        : "#18181b";

  return (
    <div
      className="aspect-video w-full max-w-lg mx-auto rounded-xl border border-zinc-700 overflow-hidden flex flex-col"
      style={{ background: bg }}
    >
      <div className={`flex-1 flex flex-col items-center px-6 ${justify}`}>
        <p
          style={{
            fontFamily: style.fontFamily,
            fontSize: Math.min(style.fontSize, 36),
            color: style.textColor,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {sampleLine}
        </p>
        <p
          style={{
            fontFamily: style.fontFamily,
            fontSize: Math.min(style.fontSize, 36),
            color: style.highlightColor,
            textAlign: "center",
          }}
        >
          {sampleLine2}
        </p>
      </div>
    </div>
  );
}
