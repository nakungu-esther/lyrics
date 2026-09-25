import { Link, useParams } from "react-router-dom";
import { LoadingScreen } from "../../../components/auth/LoadingScreen";
import { SongDetails } from "../../../components/songs/SongDetails";
import { useSong } from "../../../features/songs/hooks";

export function ArtistSongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const songQuery = useSong(id);

  if (songQuery.isLoading) return <LoadingScreen />;
  if (!songQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">Song not found.</p>
        <Link to="/artist/songs" className="text-sm text-violet-400 hover:underline">
          Back to songs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/artist/songs" className="text-sm text-violet-400 hover:underline">
        ← My songs
      </Link>
      <SongDetails song={songQuery.data} />
    </div>
  );
}
