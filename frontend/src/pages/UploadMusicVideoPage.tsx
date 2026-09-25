import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFormPost, apiGet } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function UploadMusicVideoPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [songId, setSongId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const songPoll = useQuerySong(songId);

  useEffect(() => {
    if (songPoll.detectedLanguageCode && songId) {
      navigate(`/artist/songs/${songId}/language`);
    }
  }, [songPoll.detectedLanguageCode, songId, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!video) {
      setError("Choose an MP4 file");
      return;
    }
    setError(null);
    setPending(true);
    const form = new FormData();
    form.append("title", title);
    if (genre) form.append("genre", genre);
    form.append("video", video);
    try {
      const res = await apiFormPost<{ song: { id: string } }>("/api/v1/songs/music-video", form);
      setSongId(res.song.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Upload music video</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          We extract audio, transcribe and sync lyrics, then overlay them on your original video
          when you render with the <strong className="text-zinc-300">Music Video Overlay</strong>{" "}
          template.
        </p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 max-w-md">
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Song title</span>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Genre</span>
          <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Music video (MP4)</span>
          <Input
            type="file"
            accept="video/mp4,video/*"
            required
            onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {songId && !songPoll.detectedLanguageCode && (
          <p className="text-sm text-violet-300">Processing video & extracting audio…</p>
        )}
        <Button type="submit" disabled={pending || Boolean(songId)}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>

      <Link to="/artist/videos/new" className="text-sm text-violet-400 hover:underline">
        Create lyrics video
      </Link>
    </div>
  );
}

function useQuerySong(songId: string | null) {
  const [detectedLanguageCode, setDetected] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await apiGet<{ song: { detectedLanguageCode: string | null } }>(
          `/api/v1/songs/${songId}`,
        );
        if (!cancelled && data.song.detectedLanguageCode) {
          setDetected(data.song.detectedLanguageCode);
        }
      } catch {
        /* ignore */
      }
    };
    const id = window.setInterval(() => void tick(), 2500);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [songId]);

  return { detectedLanguageCode };
}
