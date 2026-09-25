export function UploadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="mt-2 underline" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
