export function MediaUploadPlaceholder({
  label,
  hint = "Media upload will be connected in the next step.",
}: {
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-8 text-center">
      <p className="text-sm font-medium text-zinc-300">{label}</p>
      <p className="mt-2 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
