export function UploadProgress({
  label,
  progress,
  state,
}: {
  label: string;
  progress: number;
  state: string;
}) {
  if (state === "idle" || state === "done") return null;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-violet-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
