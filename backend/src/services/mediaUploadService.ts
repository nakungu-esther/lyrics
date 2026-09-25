/**
 * Placeholder for secure object-storage uploads (song audio, videos, images).
 * Step 5 stores image URLs on the artist record only; binary upload comes later.
 */
export type MediaKind =
  | "artist_profile_image"
  | "artist_cover_image"
  | "song_cover"
  | "song_audio"
  | "music_video"
  | "lyric_video";

export type PreparedUpload = {
  kind: MediaKind;
  /** Future: presigned PUT URL or upload session id */
  uploadUrl: string | null;
  publicUrl: string | null;
};

export async function prepareMediaUpload(
  _kind: MediaKind,
  _filename: string,
): Promise<PreparedUpload> {
  return {
    kind: _kind,
    uploadUrl: null,
    publicUrl: null,
  };
}
