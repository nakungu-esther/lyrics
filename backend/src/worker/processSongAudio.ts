import { executeMediaJob } from "../queues/mediaProcessing.js";
import type { SongAudioJobPayload } from "../queues/songProcessing.js";

/** @deprecated Use media-processing queue via upload completion or enqueueSongProcessing */
export async function processSongAudio(payload: SongAudioJobPayload): Promise<void> {
  await executeMediaJob({
    processingJobId: payload.jobId,
    songId: payload.songId,
    jobType: "AUDIO",
    legacySourceRelativePath: payload.sourceRelativePath,
  });
}
