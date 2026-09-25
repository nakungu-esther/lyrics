export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-zinc-400"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
