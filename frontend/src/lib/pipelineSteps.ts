import type { HubIconName } from "../components/icons/HubIcon";

export type PipelinePhase =
  | "UPLOADING"
  | "EXTRACTING_AUDIO"
  | "ANALYZING_AUDIO"
  | "DETECTING_LANGUAGE"
  | "TRANSCRIBING"
  | "SYNCING_LYRICS"
  | "READY"
  | "FAILED"
  | "RENDERING";

export type PipelineStepId =
  | "upload"
  | "audio"
  | "language"
  | "generate"
  | "sync"
  | "ready"
  | "render";

export type PipelineStep = {
  id: PipelineStepId;
  label: string;
  icon: HubIconName;
};

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "upload", label: "Uploading", icon: "upload" },
  { id: "audio", label: "Audio processing", icon: "audio" },
  { id: "language", label: "Language detection", icon: "globe" },
  { id: "generate", label: "Lyrics generation", icon: "sparkles" },
  { id: "sync", label: "Lyrics synchronization", icon: "timer" },
  { id: "ready", label: "Ready for editing", icon: "check" },
  { id: "render", label: "Video rendering", icon: "videos" },
];

const phaseOrder: Record<PipelinePhase, number> = {
  UPLOADING: 0,
  EXTRACTING_AUDIO: 1,
  ANALYZING_AUDIO: 1,
  DETECTING_LANGUAGE: 2,
  TRANSCRIBING: 3,
  SYNCING_LYRICS: 4,
  READY: 5,
  FAILED: -1,
  RENDERING: 6,
};

export function pipelineStepIndex(phase: PipelinePhase): number {
  return phaseOrder[phase] ?? 0;
}

export function stepStatus(
  stepIndex: number,
  currentIndex: number,
  failed: boolean,
): "done" | "active" | "pending" | "error" {
  if (failed && stepIndex === currentIndex) return "error";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}
