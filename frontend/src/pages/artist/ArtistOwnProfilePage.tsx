import { Link } from "react-router-dom";
import { ArtistProfileHeader } from "../../components/artist/ArtistProfileHeader";
import { Button } from "../../components/ui/Button";
import { useMyArtist } from "../../features/artist/useMyArtist";
import { LoadingScreen } from "../../components/auth/LoadingScreen";

export function ArtistOwnProfilePage() {
  const { data: artist, isLoading } = useMyArtist();

  if (isLoading) return <LoadingScreen />;
  if (!artist) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Profile</h1>
        <div className="flex gap-2">
          <Link to="/artist/profile/edit">
            <Button type="button">Edit profile</Button>
          </Link>
          <Link to={`/artists/${artist.id}`}>
            <Button type="button" variant="ghost">
              View public page
            </Button>
          </Link>
        </div>
      </div>
      <ArtistProfileHeader artist={artist} />
    </div>
  );
}
