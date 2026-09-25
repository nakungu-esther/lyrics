import assert from "node:assert/strict";
import test from "node:test";
import { exportSpec } from "../lib/exportFormats.js";
import { buildTemplateConfig } from "../lib/templateBuild.js";
import {
  applyTemplateOverrides,
  parseVideoTemplateConfig,
  resolveTemplateStyle,
} from "../lib/templateSchema.js";

test("buildTemplateConfig defaults to 4:3 canvas", () => {
  const cfg = buildTemplateConfig({
    family: "test",
    background: { type: "solid", color: "#000000" },
  });
  assert.equal(cfg.canvas.aspectRatio, "4:3");
  assert.equal(cfg.canvas.designWidth, 1440);
  assert.equal(cfg.canvas.designHeight, 1080);
  assert.equal(cfg.version, 2);
});

test("legacy v1 template config migrates to v2", () => {
  const cfg = parseVideoTemplateConfig({
    family: "karaoke",
    defaultStyle: {
      fontFamily: "Inter",
      fontSize: 50,
      animation: "karaoke-fill",
      background: { type: "solid", color: "#111" },
    },
  });
  assert.equal(cfg.version, 2);
  assert.equal(cfg.typography.fontSize, 50);
  assert.equal(cfg.highlight.mode, "karaoke");
});

test("overlay template prefers uploaded video in render plan", () => {
  const cfg = buildTemplateConfig({
    family: "overlay",
    background: { type: "video" },
    render: { preferUploadedVideo: true },
  });
  const style = resolveTemplateStyle(cfg, null);
  assert.equal(style.background.type, "video");
  assert.equal(style.render.preferUploadedVideo, true);
});

test("customizations patch editable typography fields", () => {
  const base = buildTemplateConfig({
    family: "classic",
    background: { type: "solid", color: "#0a0a0a" },
  });
  const merged = applyTemplateOverrides(base, { fontSize: 64, textColor: "#FF0000" });
  assert.equal(merged.typography.fontSize, 64);
  assert.equal(merged.typography.textColor, "#FF0000");
});

test("exportSpec CANVAS_4_3 at 1080p height", () => {
  const spec = exportSpec("CANVAS_4_3", 1080);
  assert.equal(spec.width, 1440);
  assert.equal(spec.height, 1080);
  assert.equal(spec.aspect, "RATIO_4_3");
});
