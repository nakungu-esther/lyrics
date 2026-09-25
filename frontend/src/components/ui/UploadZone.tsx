import { useCallback, useState } from "react";
import { HubIcon, type HubIconName } from "../icons/HubIcon";

type UploadZoneProps = {
  accept: string;
  hint: string;
  formats: string;
  onFile: (file: File | null) => void;
  file: File | null;
  icon?: HubIconName;
  /** Light panel (upload page mockup) */
  light?: boolean;
};

export function UploadZone({
  accept,
  hint,
  formats,
  onFile,
  file,
  icon = "upload",
  light = false,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
        dragOver
          ? light
            ? "border-blue-500 bg-blue-50"
            : "border-indigo-400 bg-indigo-500/10"
          : light
            ? "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
            : "border-zinc-600/80 bg-zinc-900/40 hover:border-indigo-500/50 hover:bg-indigo-500/5"
      }`}
    >
      <HubIcon
        name={icon}
        className={light ? "text-blue-500" : "text-indigo-400/80"}
        size={40}
        strokeWidth={1.5}
      />
      <p className={`mt-4 text-base font-medium ${light ? "text-slate-800" : "text-zinc-100"}`}>
        {hint}
      </p>
      <p className={`mt-2 text-sm ${light ? "text-slate-500" : "text-zinc-500"}`}>{formats}</p>
      {file && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">
          {file.name}
        </p>
      )}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
