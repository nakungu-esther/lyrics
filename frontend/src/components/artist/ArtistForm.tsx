import type { FormEvent, ReactNode } from "react";
import { Input as TextInput } from "../ui/Input";

export const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
] as const;

type ArtistFormProps = {
  name: string;
  biography: string;
  genre: string;
  location: string;
  website: string;
  profileImageUrl: string;
  coverImageUrl: string;
  social: Record<string, string>;
  onChange: (patch: Partial<ArtistFormProps>) => void;
  onSubmit: (e: FormEvent) => void;
  pending?: boolean;
  error?: string | null;
  success?: boolean;
  footer?: ReactNode;
};

export function ArtistForm(props: ArtistFormProps) {
  const {
    name,
    biography,
    genre,
    location,
    website,
    profileImageUrl,
    coverImageUrl,
    social,
    onChange,
    onSubmit,
    pending,
    error,
    success,
    footer,
  } = props;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm text-zinc-400">Artist name</span>
        <TextInput
          required
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-400">Bio</span>
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          value={biography}
          onChange={(e) => onChange({ biography: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Genre</span>
          <TextInput value={genre} onChange={(e) => onChange({ genre: e.target.value })} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Location</span>
          <TextInput
            value={location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-400">Website</span>
        <TextInput
          type="url"
          placeholder="https://"
          value={website}
          onChange={(e) => onChange({ website: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Profile image URL</span>
          <TextInput
            type="url"
            placeholder="https:// (object storage later)"
            value={profileImageUrl}
            onChange={(e) => onChange({ profileImageUrl: e.target.value })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Cover image URL</span>
          <TextInput
            type="url"
            placeholder="https://"
            value={coverImageUrl}
            onChange={(e) => onChange({ coverImageUrl: e.target.value })}
          />
        </label>
      </div>
      <fieldset className="space-y-3 rounded-xl border border-zinc-800 p-4">
        <legend className="px-1 text-sm text-zinc-400">Social links</legend>
        {SOCIAL_FIELDS.map(({ key, label }) => (
          <label key={key} className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
            <TextInput
              value={social[key] ?? ""}
              placeholder="https://"
              onChange={(e) =>
                onChange({ social: { ...social, [key]: e.target.value } })
              }
            />
          </label>
        ))}
      </fieldset>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {success && <p className="text-sm text-emerald-400">Profile saved.</p>}
      {footer}
      {pending !== undefined && (
        <p className="sr-only" aria-live="polite">
          {pending ? "Saving" : ""}
        </p>
      )}
    </form>
  );
}
