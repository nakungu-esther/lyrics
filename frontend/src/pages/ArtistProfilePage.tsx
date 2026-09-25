import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFormPost, apiGet, apiPatch, apiPost } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../features/auth/AuthContext";
import type { ArtistMeResponse, ArtistProfile } from "../features/artist/types";

const SOCIAL_KEYS = ["website", "instagram", "x", "youtube", "tiktok", "spotify"] as const;

export function ArtistProfilePage() {
  const { refreshSession } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["artist", "me"],
    queryFn: () => apiGet<ArtistMeResponse>("/api/v1/artists/me"),
  });

  const artist = profileQuery.data?.artist;

  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [social, setSocial] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!artist) return;
    setName(artist.name);
    setBiography(artist.biography ?? "");
    setGenre(artist.genre ?? "");
    setLocation(artist.location ?? "");
    setSocial((artist.socialLinks as Record<string, string> | null) ?? {});
  }, [artist]);

  const createProfile = useMutation({
    mutationFn: () => apiPost<{ artist: ArtistProfile }>("/api/v1/artists/me"),
    onSuccess: async () => {
      await refreshSession();
      await queryClient.invalidateQueries({ queryKey: ["artist", "me"] });
    },
  });

  const saveProfile = useMutation({
    mutationFn: () =>
      apiPatch<{ artist: ArtistProfile }>("/api/v1/artists/me", {
        name,
        biography,
        genre: genre || null,
        location: location || null,
        socialLinks: Object.fromEntries(
          Object.entries(social).filter(([, v]) => v.trim()),
        ),
      }),
    onSuccess: async () => {
      await refreshSession();
      await queryClient.invalidateQueries({ queryKey: ["artist", "me"] });
    },
  });

  const uploadImage = useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "profile" | "cover" }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      return apiFormPost<{ artist: ArtistProfile }>(
        "/api/v1/artists/me/upload-image",
        form,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artist", "me"] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void saveProfile.mutateAsync();
  }

  if (profileQuery.isLoading) {
    return <p className="text-sm text-zinc-500">Loading profile…</p>;
  }

  if (!artist) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Artist profile</h1>
        <p className="text-zinc-400">
          Set up your public artist page before uploading songs.
        </p>
        <Button
          type="button"
          disabled={createProfile.isPending}
          onClick={() => void createProfile.mutate()}
        >
          {createProfile.isPending ? "Creating…" : "Create artist profile"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Artist profile</h1>
        <p className="mt-1 text-sm text-zinc-400">Slug: {artist.slug}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm text-zinc-400">Profile picture</span>
          {artist.profileImageUrl && (
            <img
              src={artist.profileImageUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover border border-zinc-700"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage.mutate({ file, kind: "profile" });
            }}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-400">Cover image</span>
          {artist.coverImageUrl && (
            <img
              src={artist.coverImageUrl}
              alt=""
              className="h-24 w-full rounded-lg object-cover border border-zinc-700"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage.mutate({ file, kind: "cover" });
            }}
          />
        </label>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Artist name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Bio</span>
          <textarea
            className="w-full min-h-[120px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Genre</span>
          <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Location</span>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </label>

        <fieldset className="space-y-3 rounded-xl border border-zinc-800 p-4">
          <legend className="px-1 text-sm text-zinc-400">Social links</legend>
          {SOCIAL_KEYS.map((key) => (
            <label key={key} className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-zinc-500">{key}</span>
              <Input
                value={social[key] ?? ""}
                onChange={(e) =>
                  setSocial((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder="https://"
              />
            </label>
          ))}
        </fieldset>

        {saveProfile.isError && (
          <p className="text-sm text-red-400">Could not save profile.</p>
        )}
        {saveProfile.isSuccess && (
          <p className="text-sm text-emerald-400">Profile saved.</p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? "Saving…" : "Save profile"}
          </Button>
          <Link to="/artist/dashboard">
            <Button type="button" variant="ghost">
              Artist dashboard
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
