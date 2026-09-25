import { z } from "zod";

/** Design-time canvas — 4:3 is the platform default. */
export const templateCanvasSchema = z.object({
  aspectRatio: z.literal("4:3").default("4:3"),
  designWidth: z.number().int().min(640).max(3840).default(1440),
  designHeight: z.number().int().min(480).max(2160).default(1080),
});

export const gradientStopSchema = z.object({
  color: z.string().max(20),
  at: z.number().min(0).max(1),
});

export const templateBackgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: z.string().max(20).default("#0a0a0a") }),
  z.object({
    type: z.literal("gradient"),
    angle: z.number().min(0).max(360).default(160),
    stops: z.array(gradientStopSchema).min(2).max(6),
  }),
  z.object({ type: z.literal("video") }),
  z.object({ type: z.literal("cover") }),
  z.object({ type: z.literal("blur") }),
]);

export const templateTypographySchema = z.object({
  fontFamily: z.string().max(80).default("Inter"),
  fontSize: z.number().min(12).max(120).default(42),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold"]).default("semibold"),
  textColor: z.string().max(20).default("#FFFFFF"),
  letterSpacing: z.number().min(-2).max(12).default(0),
  lineHeight: z.number().min(0.8).max(2.5).default(1.2),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
});

export const templateHighlightSchema = z.object({
  mode: z.enum(["none", "line", "word", "karaoke"]).default("word"),
  color: z.string().max(20).default("#A78BFA"),
  activeScale: z.number().min(1).max(1.5).default(1.05),
});

export const templateAnimationSchema = z.object({
  lineEntrance: z.enum(["none", "fade", "slide-up", "slide-down", "pop", "typewriter"]).default("fade"),
  lineExit: z.enum(["none", "fade"]).default("fade"),
  karaokeFill: z.boolean().default(false),
});

export const templateEffectsSchema = z.object({
  textShadow: z.string().max(120).optional(),
  outlineWidth: z.number().min(0).max(8).default(2),
  outlineColor: z.string().max(20).default("#000000"),
  glow: z.boolean().default(false),
  glowColor: z.string().max(20).optional(),
  backgroundBox: z.boolean().default(false),
  backgroundBoxColor: z.string().max(20).default("#00000080"),
  backgroundBoxPadding: z.number().min(0).max(48).default(12),
});

export const templateTransitionsSchema = z.object({
  lineFadeInMs: z.number().min(0).max(2000).default(200),
  lineFadeOutMs: z.number().min(0).max(2000).default(200),
  crossfadeMs: z.number().min(0).max(1000).default(0),
});

export const templateRenderHintsSchema = z.object({
  preferUploadedVideo: z.boolean().default(false),
  preferUploadedAudio: z.boolean().default(true),
  padUploadedVideo: z.enum(["cover", "contain", "stretch"]).default("cover"),
});

export const exportFormatIdSchema = z.enum([
  "CANVAS_4_3",
  "YOUTUBE_16_9",
  "TIKTOK_9_16",
  "REELS_9_16",
  "SQUARE_1_1",
]);

export const videoTemplateConfigV2Schema = z.object({
  version: z.literal(2),
  family: z.string().max(64),
  emoji: z.string().max(8).optional(),
  category: z.enum(["style", "gospel", "afrobeat", "romantic", "format"]).default("style"),
  tags: z.array(z.string().max(40)).optional(),
  suggestedExportFormat: exportFormatIdSchema.default("CANVAS_4_3"),
  canvas: templateCanvasSchema.default({ aspectRatio: "4:3", designWidth: 1440, designHeight: 1080 }),
  background: templateBackgroundSchema,
  typography: templateTypographySchema.default({}),
  highlight: templateHighlightSchema.default({}),
  animation: templateAnimationSchema.default({}),
  effects: templateEffectsSchema.default({}),
  transitions: templateTransitionsSchema.default({}),
  render: templateRenderHintsSchema.default({}),
  editableProperties: z.array(z.string().max(80)).default([
    "typography.fontFamily",
    "typography.fontSize",
    "typography.textColor",
    "typography.position",
    "highlight.color",
    "highlight.mode",
    "animation.lineEntrance",
    "effects.textShadow",
    "effects.outlineWidth",
    "background.color",
  ]),
});

export type VideoTemplateConfigV2 = z.infer<typeof videoTemplateConfigV2Schema>;
export type TemplateBackground = z.infer<typeof templateBackgroundSchema>;
export type ExportFormatId = z.infer<typeof exportFormatIdSchema>;

/** Legacy flat style (v1 seeds / stored customizations). */
export const legacyVideoCustomizationSchema = z.object({
  fontFamily: z.string().max(80).optional(),
  fontSize: z.number().min(12).max(120).optional(),
  textColor: z.string().max(20).optional(),
  highlightColor: z.string().max(20).optional(),
  textShadow: z.string().max(120).optional(),
  position: z.enum(["top", "center", "bottom"]).optional(),
  animation: z.enum(["none", "fade", "karaoke-fill"]).optional(),
  background: z
    .object({
      type: z.enum(["solid", "blur", "video", "cover", "gradient"]),
      color: z.string().optional(),
    })
    .optional(),
  preferredExportFormat: exportFormatIdSchema.optional(),
});

export type LegacyVideoCustomization = z.infer<typeof legacyVideoCustomizationSchema>;

export type ResolvedTemplateStyle = {
  canvas: z.infer<typeof templateCanvasSchema>;
  background: TemplateBackground;
  typography: z.infer<typeof templateTypographySchema>;
  highlight: z.infer<typeof templateHighlightSchema>;
  animation: z.infer<typeof templateAnimationSchema>;
  effects: z.infer<typeof templateEffectsSchema>;
  transitions: z.infer<typeof templateTransitionsSchema>;
  render: z.infer<typeof templateRenderHintsSchema>;
  karaoke: boolean;
};

function legacyBackgroundToV2(bg: LegacyVideoCustomization["background"]): TemplateBackground {
  if (!bg) return { type: "solid", color: "#0a0a0a" };
  if (bg.type === "gradient") {
    return {
      type: "gradient",
      angle: 160,
      stops: [
        { color: bg.color ?? "#1e1b4b", at: 0 },
        { color: "#0f172a", at: 1 },
      ],
    };
  }
  if (bg.type === "video") return { type: "video" };
  if (bg.type === "cover") return { type: "cover" };
  if (bg.type === "blur") return { type: "blur" };
  return { type: "solid", color: bg.color ?? "#0a0a0a" };
}

function migrateLegacyConfig(raw: Record<string, unknown>): VideoTemplateConfigV2 {
  const legacyStyle = legacyVideoCustomizationSchema.safeParse(raw.defaultStyle ?? raw);
  const ds = legacyStyle.success ? legacyStyle.data : {};

  const animationLine =
    ds.animation === "karaoke-fill"
      ? "fade"
      : ds.animation === "fade"
        ? "fade"
        : "none";

  return videoTemplateConfigV2Schema.parse({
    version: 2,
    family: typeof raw.family === "string" ? raw.family : "classic",
    emoji: raw.emoji,
    category: raw.category ?? "style",
    tags: raw.tags,
    suggestedExportFormat: raw.suggestedExportFormat ?? "CANVAS_4_3",
    canvas: raw.canvas ?? { aspectRatio: "4:3", designWidth: 1440, designHeight: 1080 },
    background: raw.background
      ? templateBackgroundSchema.parse(raw.background)
      : legacyBackgroundToV2(ds.background),
    typography: {
      fontFamily: ds.fontFamily ?? "Inter",
      fontSize: ds.fontSize ?? 42,
      fontWeight: "semibold",
      textColor: ds.textColor ?? "#FFFFFF",
      letterSpacing: 0,
      lineHeight: 1.2,
      position: ds.position ?? "bottom",
      alignment: "center",
    },
    highlight: {
      mode: ds.animation === "karaoke-fill" ? "karaoke" : "word",
      color: ds.highlightColor ?? "#A78BFA",
      activeScale: 1.05,
    },
    animation: {
      lineEntrance: animationLine,
      lineExit: "fade",
      karaokeFill: ds.animation === "karaoke-fill",
    },
    effects: {
      textShadow: ds.textShadow,
      outlineWidth: 2,
      outlineColor: "#000000",
      glow: false,
      backgroundBox: false,
      backgroundBoxColor: "#00000080",
      backgroundBoxPadding: 12,
    },
    transitions: { lineFadeInMs: 200, lineFadeOutMs: 200, crossfadeMs: 0 },
    render: {
      preferUploadedVideo:
        ds.background?.type === "video" || raw.family === "overlay",
      preferUploadedAudio: true,
      padUploadedVideo: "cover",
    },
    editableProperties: raw.editableProperties,
  });
}

export function parseVideoTemplateConfig(raw: unknown): VideoTemplateConfigV2 {
  if (!raw || typeof raw !== "object") {
    return videoTemplateConfigV2Schema.parse(migrateLegacyConfig({ family: "classic" }));
  }
  const obj = raw as Record<string, unknown>;
  if (obj.version === 2) {
    return videoTemplateConfigV2Schema.parse(obj);
  }
  return migrateLegacyConfig(obj);
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!;
    if (typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;
}

function legacyPatchToPaths(patch: LegacyVideoCustomization): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.fontFamily !== undefined) out["typography.fontFamily"] = patch.fontFamily;
  if (patch.fontSize !== undefined) out["typography.fontSize"] = patch.fontSize;
  if (patch.textColor !== undefined) out["typography.textColor"] = patch.textColor;
  if (patch.highlightColor !== undefined) out["highlight.color"] = patch.highlightColor;
  if (patch.position !== undefined) out["typography.position"] = patch.position;
  if (patch.textShadow !== undefined) out["effects.textShadow"] = patch.textShadow;
  if (patch.animation === "karaoke-fill") {
    out["highlight.mode"] = "karaoke";
    out["animation.karaokeFill"] = true;
  } else if (patch.animation === "fade") {
    out["animation.lineEntrance"] = "fade";
  } else if (patch.animation === "none") {
    out["animation.lineEntrance"] = "none";
  }
  if (patch.background?.type === "solid" && patch.background.color) {
    out.background = { type: "solid", color: patch.background.color };
  }
  if (patch.background?.type === "video") {
    out.background = { type: "video" };
    out["render.preferUploadedVideo"] = true;
  }
  return out;
}

export function applyTemplateOverrides(
  config: VideoTemplateConfigV2,
  customizations: unknown,
): VideoTemplateConfigV2 {
  if (!customizations || typeof customizations !== "object") return config;
  const patch = legacyVideoCustomizationSchema.safeParse(customizations);
  if (!patch.success) return config;

  const merged = structuredClone(config) as unknown as Record<string, unknown>;
  const paths = legacyPatchToPaths(patch.data);
  for (const [path, value] of Object.entries(paths)) {
    if (path === "background") {
      merged.background = value;
    } else {
      setByPath(merged, path, value);
    }
  }
  return videoTemplateConfigV2Schema.parse(merged);
}

export function resolveTemplateStyle(
  configRaw: unknown,
  customizations: unknown,
): ResolvedTemplateStyle {
  const config = applyTemplateOverrides(parseVideoTemplateConfig(configRaw), customizations);
  const karaoke =
    config.highlight.mode === "karaoke" ||
    config.animation.karaokeFill ||
    config.family === "karaoke";

  return {
    canvas: config.canvas,
    background: config.background,
    typography: config.typography,
    highlight: config.highlight,
    animation: config.animation,
    effects: config.effects,
    transitions: config.transitions,
    render: config.render,
    karaoke,
  };
}

/** Flat shape for existing SPA editor + API PATCH. */
export function toLegacyCustomization(
  config: VideoTemplateConfigV2,
  customizations?: unknown,
): LegacyVideoCustomization & { preferredExportFormat?: ExportFormatId } {
  const resolved = resolveTemplateStyle(config, customizations);
  const anim = resolved.karaoke
    ? "karaoke-fill"
    : resolved.animation.lineEntrance === "none"
      ? "none"
      : "fade";

  let background: LegacyVideoCustomization["background"];
  switch (resolved.background.type) {
    case "video":
      background = { type: "video" };
      break;
    case "gradient":
      background = {
        type: "gradient",
        color: resolved.background.stops[0]?.color,
      };
      break;
    case "cover":
      background = { type: "cover" };
      break;
    case "blur":
      background = { type: "blur" };
      break;
    default:
      background = { type: "solid", color: resolved.background.color };
  }

  return {
    fontFamily: resolved.typography.fontFamily,
    fontSize: resolved.typography.fontSize,
    textColor: resolved.typography.textColor,
    highlightColor: resolved.highlight.color,
    textShadow: resolved.effects.textShadow,
    position: resolved.typography.position,
    animation: anim,
    background,
    preferredExportFormat: config.suggestedExportFormat,
  };
}

export function assAlignment(position: "top" | "center" | "bottom"): number {
  switch (position) {
    case "top":
      return 8;
    case "center":
      return 5;
    default:
      return 2;
  }
}
