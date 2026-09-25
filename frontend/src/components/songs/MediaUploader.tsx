import { useRef } from "react";
import { HubIcon } from "../icons/HubIcon";
import { Button } from "../ui/Button";
import { UploadError } from "./UploadError";
import { UploadProgress } from "./UploadProgress";
import { useMediaUpload, type UploadState } from "../../features/uploads/useMediaUpload";
import type { UploadResourceType } from "../../api/uploads";

const ACCEPT: Record<UploadResourceType, string> = {
  SONG_AUDIO: "audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/flac,.mp3,.wav,.m4a,.aac,.flac",
  SONG_COVER: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  MUSIC_VIDEO: "video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm",
  ARTIST_PROFILE: "image/jpeg,image/png,image/webp",
  ARTIST_COVER: "image/jpeg,image/png,image/webp",
};

type MediaUploaderProps = {
  songId: string | undefined;
  resourceType: UploadResourceType;
  label: string;
  uploaded?: boolean;
  onComplete?: () => void;
};

function stateLabel(state: UploadState): string {
  if (state === "done") return "Uploaded";
  if (state === "presigning") return "Preparing…";
  if (state === "completing") return "Saving…";
  return "";
}

export function MediaUploader({
  songId,
  resourceType,
  label,
  uploaded,
  onComplete,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, state, progress, error, reset } = useMediaUpload(songId);

  async function onFile(file: File) {
    const ok = await upload(file, resourceType);
    if (ok) onComplete?.();
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {(uploaded || state === "done") && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <HubIcon name="check" size={14} />
            {stateLabel("done")}
          </span>
        )}
      </div>
      {!songId && (
        <p className="text-xs text-zinc-500">Save song information first to enable uploads.</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[resourceType]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="ghost"
        leadingIcon="upload"
        disabled={!songId || state === "uploading" || state === "presigning"}
        onClick={() => inputRef.current?.click()}
      >
        {uploaded ? "Replace file" : "Choose file"}
      </Button>
      <UploadProgress label={`Uploading ${label.toLowerCase()}`} progress={progress} state={state} />
      {error && <UploadError message={error} onRetry={reset} />}
    </div>
  );
}

export function AudioUploader(props: Omit<MediaUploaderProps, "resourceType" | "label">) {
  return <MediaUploader {...props} resourceType="SONG_AUDIO" label="Audio (MP3, WAV, M4A…)" />;
}

export function ImageUploader(props: Omit<MediaUploaderProps, "resourceType" | "label">) {
  return <MediaUploader {...props} resourceType="SONG_COVER" label="Cover image" />;
}

export function VideoUploader(props: Omit<MediaUploaderProps, "resourceType" | "label">) {
  return <MediaUploader {...props} resourceType="MUSIC_VIDEO" label="Music video (optional)" />;
}
