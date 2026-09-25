import type { FormEvent, ReactNode } from "react";
import { Input } from "../ui/Input";
import type { AlbumOption } from "../../features/songs/types";
import { MediaUploadPlaceholder } from "./MediaUploadPlaceholder";
import { GenreSelect } from "./GenreSelect";

export type SongFormValues = {
  title: string;
  description: string;
  genre: string;
  subgenre: string;
  releaseDate: string;
  albumId: string;
};
type SongFormProps = {
  values: SongFormValues;
  onChange: (patch: Partial<SongFormValues>) => void;
  onSubmit: (e: FormEvent) => void;
  albums: AlbumOption[];
  showMediaPlaceholders?: boolean;
  children?: ReactNode;
};

export function SongForm({
  values,
  onChange,
  onSubmit,
  albums,
  showMediaPlaceholders,
  children,
}: SongFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="text-sm font-medium text-zinc-300">Song information</h2>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Song title</span>
          <Input
            required
            value={values.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Description</span>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </label>
        <GenreSelect
          genre={values.genre}
          subgenre={values.subgenre}
          onChange={(patch) => onChange(patch)}
        />
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Release date</span>
          <Input
            type="date"
            value={values.releaseDate}
            onChange={(e) => onChange({ releaseDate: e.target.value })}
          />
        </label>        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Album</span>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={values.albumId}
            onChange={(e) => onChange({ albumId: e.target.value })}
          >
            <option value="">Single (no album)</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showMediaPlaceholders && (
        <div className="grid gap-4 md:grid-cols-3">
          <MediaUploadPlaceholder label="Audio" />
          <MediaUploadPlaceholder label="Cover image" />
          <MediaUploadPlaceholder label="Music video" />
        </div>
      )}

      {children}
    </form>
  );
}
