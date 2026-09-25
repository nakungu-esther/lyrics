import { prisma } from "../../lib/prisma.js";
import { isSupportedLanguage } from "../../lib/languageCatalog.js";

export type AsrProviderConfig = {
  providerId: string;
  modelId: string | null;
  fallbackProviderId: string | null;
  vocabularyProfileId: string | null;
};

/**
 * Maps a confirmed language to ASR provider/model configuration.
 * Does not perform transcription — prepares Step 10 wiring.
 */
export async function resolveAsrProviderForLanguage(
  languageCode: string,
): Promise<AsrProviderConfig | null> {
  if (!isSupportedLanguage(languageCode)) return null;
  const row = await prisma.language.findUnique({ where: { code: languageCode } });
  if (!row) return null;
  return {
    providerId: row.transcriptionProviderId ?? "default",
    modelId: row.transcriptionModelId,
    fallbackProviderId: row.fallbackProviderId,
    vocabularyProfileId: `vocab-${languageCode}`,
  };
}
