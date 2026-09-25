import { Button } from "../ui/Button";

export function DeleteSongDialog({
  open,
  title,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Delete song?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          This will permanently remove <span className="text-zinc-200">{title}</span>. This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="danger" leadingIcon="delete" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
