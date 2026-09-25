import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { createArtist } from "../../api/artists";
import { ArtistForm } from "../../components/artist/ArtistForm";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../features/auth/AuthContext";
import { authKeys } from "../../features/auth/queryKeys";
import { artistKeys } from "../../features/artist/queryKeys";
import { useMyArtist } from "../../features/artist/useMyArtist";

export function CreateArtistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();
  const { data: existing } = useMyArtist();

  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createArtist({
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
      await refreshSession();
      await queryClient.invalidateQueries({ queryKey: artistKeys.me });
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      navigate("/artist/dashboard");
    },
  });

  if (existing) {
    return <Navigate to="/artist/dashboard" replace />;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Artist name is required.");
      return;
    }
    mutation.mutate(undefined, {
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : "Could not create profile.");
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold">Create artist profile</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Share your music identity on LyricsHub. Verification is reviewed separately—you are not
          verified automatically.
        </p>
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
        pending={mutation.isPending}
        error={error}
        footer={
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create profile"}
            </Button>
            <Link to="/dashboard">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
