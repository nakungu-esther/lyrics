import { apiPost } from "./client";

export type UploadResourceType =
  | "SONG_AUDIO"
  | "SONG_COVER"
  | "MUSIC_VIDEO"
  | "ARTIST_PROFILE"
  | "ARTIST_COVER";

export type PresignResponse = {
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
  method: "PUT";
  headers?: Record<string, string>;
};

export async function presignUpload(input: {
  resourceType: UploadResourceType;
  songId?: string;
  filename: string;
  contentType: string;
  size: number;
}): Promise<PresignResponse> {
  const body = await apiPost<{ success: boolean; data: PresignResponse }>(
    "/api/v1/uploads/presign",
    input,
  );
  return body.data;
}

export async function completeUpload(input: {
  resourceType: UploadResourceType;
  songId?: string;
  objectKey: string;
  contentType: string;
  size: number;
}): Promise<void> {
  await apiPost("/api/v1/uploads/complete", input);
}

export async function uploadFileToStorage(
  file: File,
  presign: PresignResponse,
  onProgress?: (pct: number) => void,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(presign.method, presign.uploadUrl);
    const contentType = presign.headers?.["Content-Type"] ?? file.type;
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}
