import fs from "node:fs/promises";
import { mapWhisperLanguage } from "../lib/languageCatalog.js";
import type {
  LanguageDetectionResult,
  TranscriptionResult,
  TranscriptionSegment,
} from "./types.js";

/**
 * Dev-friendly STT: uses sample Luganda lyrics with plausible timings when no external AI is configured.
 * Set `AI_TRANSCRIBE_MODE=whisper` later to plug in Whisper.
 */
export async function detectLanguageFromAudio(
  _audioPath: string,
): Promise<LanguageDetectionResult> {
  return { code: "lg", confidence: 0.94 };
}

const DEMO_LUGANDA: { section: string; lines: string[] }[] = [
  {
    section: "VERSE 1",
    lines: ["Nze nkuyagala nnyo", "Omutima gwange gukwagala"],
  },
  {
    section: "CHORUS",
    lines: ["Nze nkuyagala nnyo", "Omutima gwange gukwagala", "Tukwatagane emirembe gyonna"],
  },
];

function buildDemoTranscription(
  durationSeconds: number,
  languageCode: string,
): TranscriptionResult {
  const segments: TranscriptionSegment[] = [];
  let t = Math.min(12.2, durationSeconds * 0.15);
  const lineDuration = 2.0;

  for (const block of DEMO_LUGANDA) {
    for (const line of block.lines) {
      const words = line.split(/\s+/).filter(Boolean);
      const lineEnd = Math.min(t + lineDuration, durationSeconds);
      const wordDur = (lineEnd - t) / Math.max(words.length, 1);
      const wordStamps = words.map((text, i) => ({
        text,
        startTime: t + i * wordDur,
        endTime: t + (i + 1) * wordDur,
        confidence: 0.88,
      }));
      segments.push({
        text: line,
        startTime: t,
        endTime: lineEnd,
        words: wordStamps,
      });
      t = lineEnd + 0.3;
      if (t >= durationSeconds) break;
    }
    if (t >= durationSeconds) break;
  }

  return {
    segments,
    languageCode,
    modelVersion: "demo-v1",
  };
}

export async function transcribeAudioFile(
  audioPath: string,
  languageCode: string,
): Promise<TranscriptionResult> {
  const mode = process.env.AI_TRANSCRIBE_MODE ?? "demo";
  if (mode === "whisper") {
    try {
      const { transcribeWithWhisper } = await import("./whisperLocal.js");
      return transcribeWithWhisper(audioPath, languageCode);
    } catch {
      /* fall through to demo */
    }
  }

  let duration = 240;
  try {
    const stat = await fs.stat(audioPath);
    duration = Math.max(30, Math.min(600, stat.size / 5000));
  } catch {
    /* ignore */
  }

  return buildDemoTranscription(duration, mapWhisperLanguage(languageCode));
}
