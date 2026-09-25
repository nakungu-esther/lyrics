import type { ResolvedTemplateStyle } from "./templateSchema.js";
import { assAlignment } from "./templateSchema.js";

type LineInput = {
  text: string;
  startTime: number;
  endTime: number;
  words?: { text: string; startTime: number; endTime: number }[];
};

function assTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const cs = Math.floor((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function hexToAssBgr(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "&H00FFFFFF";
  const r = h.slice(0, 2);
  const g = h.slice(2, 4);
  const b = h.slice(4, 6);
  return `&H00${b}${g}${r}`.toUpperCase();
}

function karaokeLine(words: { text: string; startTime: number; endTime: number }[]): string {
  let out = "";
  for (const w of words) {
    const durCs = Math.max(1, Math.round((w.endTime - w.startTime) * 100));
    out += `{\\k${durCs}}${w.text} `;
  }
  return out.trim();
}

function entranceTags(style: ResolvedTemplateStyle): string {
  const fin = style.transitions.lineFadeInMs;
  const fout = style.transitions.lineFadeOutMs;
  const parts: string[] = [];
  if (style.animation.lineEntrance === "fade" || fin > 0) {
    parts.push(`\\fad(${fin},${fout})`);
  }
  if (style.animation.lineEntrance === "slide-up") {
    parts.push(`\\move(960,920,960,880,0,${Math.min(fin, 400)})`);
  }
  if (style.animation.lineEntrance === "pop") {
    parts.push("\\fscx110\\fscy110\\t(0,180,\\fscx100\\fscy100)");
  }
  if (style.effects.outlineWidth > 0) {
    parts.push(`\\bord${style.effects.outlineWidth}`);
  }
  if (style.effects.textShadow) {
    parts.push("\\shad2");
  }
  if (style.effects.glow && style.effects.glowColor) {
    parts.push(`\\3c${hexToAssBgr(style.effects.glowColor)}\\blur3`);
  }
  if (parts.length === 0) return "";
  return `{${parts.join("")}}`;
}

export function buildAssContentFromTemplate(
  lines: LineInput[],
  style: ResolvedTemplateStyle,
  playResX: number,
  playResY: number,
): string {
  const primary = hexToAssBgr(style.typography.textColor);
  const secondary = hexToAssBgr(style.highlight.color);
  const align = assAlignment(style.typography.position);
  const fontSize = style.typography.fontSize;
  const bold = style.typography.fontWeight === "bold" || style.typography.fontWeight === "semibold" ? -1 : 0;
  const outline = style.effects.outlineWidth;
  const shadow = style.effects.textShadow ? 2 : 0;

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${playResX}
PlayResY: ${playResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.typography.fontFamily},${fontSize},${primary},${secondary},&H00000000,&H80000000,${bold},0,0,0,100,100,${style.typography.letterSpacing},0,1,${outline},${shadow},${align},40,40,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const karaoke = style.karaoke;

  const events = lines
    .map((line) => {
      const start = assTime(line.startTime);
      const end = assTime(line.endTime);
      let text = line.text;
      if (karaoke && line.words?.length) {
        text = karaokeLine(line.words);
      }
      text = `${entranceTags(style)}${text}`;
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
    })
    .join("\n");

  return `${header}${events}\n`;
}

/** @deprecated Use buildAssContentFromTemplate */
export function buildAssContent(
  lines: LineInput[],
  style: {
    fontFamily: string;
    fontSize: number;
    textColor: string;
    highlightColor: string;
    position: "top" | "center" | "bottom";
    animation: "none" | "fade" | "karaoke-fill";
    textShadow?: string;
  },
  karaoke: boolean,
  playResX = 1280,
  playResY = 720,
): string {
  const resolved: ResolvedTemplateStyle = {
    canvas: { aspectRatio: "4:3", designWidth: 1440, designHeight: 1080 },
    background: { type: "solid", color: "#0a0a0a" },
    typography: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: "semibold",
      textColor: style.textColor,
      letterSpacing: 0,
      lineHeight: 1.2,
      position: style.position,
      alignment: "center",
    },
    highlight: {
      mode: karaoke ? "karaoke" : "word",
      color: style.highlightColor,
      activeScale: 1.05,
    },
    animation: {
      lineEntrance: style.animation === "none" ? "none" : "fade",
      lineExit: "fade",
      karaokeFill: style.animation === "karaoke-fill",
    },
    effects: {
      textShadow: style.textShadow,
      outlineWidth: 2,
      outlineColor: "#000000",
      glow: false,
      backgroundBox: false,
      backgroundBoxColor: "#00000080",
      backgroundBoxPadding: 12,
    },
    transitions: { lineFadeInMs: 200, lineFadeOutMs: 200, crossfadeMs: 0 },
    render: { preferUploadedVideo: false, preferUploadedAudio: true, padUploadedVideo: "cover" },
    karaoke,
  };
  return buildAssContentFromTemplate(lines, resolved, playResX, playResY);
}
