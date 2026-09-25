import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { updateMyArtist } from "../../api/artists";
import { ArtistForm } from "../../components/artist/ArtistForm";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/auth/LoadingScreen";
import { artistKeys } from "../../features/artist/queryKeys";
import { useMyArtist } from "../../features/artist/useMyArtist";

export function ArtistProfileEditPage() {
  const queryClient = useQueryClient();
  const { data: artist, isLoading } = useMyArtist();

  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!artist) return;
    setName(artist.name);
    setBiography(artist.biography ?? "");
    setGenre(artist.genre ?? "");
    setLocation(artist.location ?? "");
    setWebsite(artist.website ?? "");
    setProfileImageUrl(artist.profileImageUrl ?? "");
    setCoverImageUrl(artist.coverImageUrl ?? "");
    setSocial(artist.socialLinks ?? {});
  }, [artist]);

  const save = useMutation({
    mutationFn: () =>
      updateMyArtist({
        name: name.trim(),
        biography: biography.trim() || undefined,
        genre: genre.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        profileImageUrl: profileImageUrl.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        socialLinks: Object.fromEntries(
          Object.entries(social).filter(([, v]) => v.trim()),
        ),
      }),
    onSuccess: async () => {
      setSaved(true);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: artistKeys.me });
      await queryClient.invalidateQueries({ queryKey: artistKeys.dashboard });
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (!artist) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    save.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : "Could not save profile.");
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Edit profile</h1>
        <Link to="/artist/profile" className="text-sm text-violet-400 hover:underline">
          Back to profile
        </Link>
      </div>
      <ArtistForm
        name={name}
        biography={biography}
        genre={genre}
        location={location}
        website={website}
        profileImageUrl={profileImageUrl}
        coverImageUrl={coverImageUrl}
        social={social}
        onChange={(patch) => {
          if (patch.name !== undefined) setName(patch.name);
          if (patch.biography !== undefined) setBiography(patch.biography);
          if (patch.genre !== undefined) setGenre(patch.genre);
          if (patch.location !== undefined) setLocation(patch.location);
          if (patch.website !== undefined) setWebsite(patch.website);
          if (patch.profileImageUrl !== undefined) setProfileImageUrl(patch.profileImageUrl);
          if (patch.coverImageUrl !== undefined) setCoverImageUrl(patch.coverImageUrl);
          if (patch.social !== undefined) setSocial(patch.social);
        }}
        onSubmit={onSubmit}
        pending={save.isPending}
        error={error}
        success={saved}
        footer={
          <Button type="submit" disabled={save.isPending} className="mt-2">
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        }
      />
    </div>
  );
}
