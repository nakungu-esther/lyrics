import type { VideoTemplateConfigV2 } from "./templateSchema.js";
import {
  templateAnimationSchema,
  templateBackgroundSchema,
  templateCanvasSchema,
  templateEffectsSchema,
  templateHighlightSchema,
  templateRenderHintsSchema,
  templateTransitionsSchema,
  templateTypographySchema,
  videoTemplateConfigV2Schema,
  type ExportFormatId,
  type TemplateBackground,
} from "./templateSchema.js";

export type TemplateBuildInput = {
  family: string;
  emoji?: string;
  category?: "style" | "gospel" | "afrobeat" | "romantic" | "format";
  tags?: string[];
  suggestedExportFormat?: ExportFormatId;
  background: TemplateBackground;
  typography?: Partial<VideoTemplateConfigV2["typography"]>;
  highlight?: Partial<VideoTemplateConfigV2["highlight"]>;
  animation?: Partial<VideoTemplateConfigV2["animation"]>;
  effects?: Partial<VideoTemplateConfigV2["effects"]>;
  transitions?: Partial<VideoTemplateConfigV2["transitions"]>;
  render?: Partial<VideoTemplateConfigV2["render"]>;
  editableProperties?: string[];
};

/** All templates share 4:3 design canvas unless export preset differs at render time. */
export function buildTemplateConfig(input: TemplateBuildInput): VideoTemplateConfigV2 {
  return videoTemplateConfigV2Schema.parse({
    version: 2,
    family: input.family,
    emoji: input.emoji,
    category: input.category ?? "style",
    tags: input.tags,
    suggestedExportFormat: input.suggestedExportFormat ?? "CANVAS_4_3",
    canvas: templateCanvasSchema.parse({ aspectRatio: "4:3", designWidth: 1440, designHeight: 1080 }),
    background: templateBackgroundSchema.parse(input.background),
    typography: templateTypographySchema.parse(input.typography ?? {}),
    highlight: templateHighlightSchema.parse(input.highlight ?? {}),
    animation: templateAnimationSchema.parse(input.animation ?? {}),
    effects: templateEffectsSchema.parse(input.effects ?? {}),
    transitions: templateTransitionsSchema.parse(input.transitions ?? {}),
    render: templateRenderHintsSchema.parse(input.render ?? {}),
    editableProperties: input.editableProperties,
  });
}
