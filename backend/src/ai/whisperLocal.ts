/**
 * Optional Whisper path — install @huggingface/transformers in worker image when enabling.
 * Kept separate so default installs stay lightweight.
 */
import type { TranscriptionResult } from "./types.js";

export async function transcribeWithWhisper(
  _audioPath: string,
  languageCode: string,
): Promise<TranscriptionResult> {
  throw new Error(
    `Whisper not installed. Set AI_TRANSCRIBE_MODE=demo or add @huggingface/transformers. Language: ${languageCode}`,
  );
}
