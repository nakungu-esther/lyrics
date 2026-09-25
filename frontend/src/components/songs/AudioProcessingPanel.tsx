import { Button } from "../ui/Button";
import { UploadProgress } from "./UploadProgress";
import { UploadError } from "./UploadError";
import {
  useAudioProcessingStatus,
  useRetryAudioProcessing,
} from "../../features/songs/useAudioProcessing";
import type { SongMediaSlot } from "../../features/songs/types";

type Props = {
  songId: string;
  audio?: SongMediaSlot;
};

export function AudioProcessingPanel({ songId, audio }: Props) {
  const hasOriginal = Boolean(audio?.uploaded);
  const processingQuery = useAudioProcessingStatus(songId, hasOriginal);
  const retry = useRetryAudioProcessing(songId);

  if (!hasOriginal) {
    return (
      <p className="text-sm text-zinc-500">Upload audio to start background processing.</p>
    );
  }

  const data = processingQuery.data;
  const status = data?.status ?? "IDLE";
  const progress = data?.progress ?? 0;
  const stage = data?.stage ?? "Waiting…";

  if (status === "COMPLETED" || audio?.processed) {
    return (
      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-sm text-emerald-200">
        ✓ Audio processing completed — original and processed files are stored.
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="space-y-3">
        <UploadError
          message={data?.error ?? "Audio processing failed."}
          onRetry={() => retry.mutate()}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={retry.isPending}
          onClick={() => retry.mutate()}
        >
          {retry.isPending ? "Retrying…" : "Retry processing"}
        </Button>
      </div>
    );
  }

  if (status === "QUEUED" || status === "PROCESSING") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-200">Audio processing</p>
        <p className="text-xs text-zinc-400">{stage}</p>
        <UploadProgress
          label="Processing audio"
          progress={progress}
          state={status === "QUEUED" ? "presigning" : "uploading"}
        />
      </div>
    );
  }

  return (
    <p className="text-sm text-zinc-500">
      Audio uploaded. Processing will start when the worker is running.
    </p>
  );
}
