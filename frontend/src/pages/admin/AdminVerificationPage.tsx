import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../api/client";
import { HubIcon } from "../../components/icons/HubIcon";
import { Button } from "../../components/ui/Button";

export function AdminVerificationPage() {
  const qc = useQueryClient();
  const verifications = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: () =>
      apiGet<{
        verifications: { id: string; artist: { name: string }; requestedBy: { email: string } }[];
      }>("/api/v1/admin/verifications"),
  });

  const approve = useMutation({
    mutationFn: (id: string) => apiPost(`/api/v1/admin/verifications/${id}/approve`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-verifications"] });
      void qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) => apiPost(`/api/v1/admin/verifications/${id}/reject`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-verifications"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <HubIcon name="verified" className="text-emerald-400" size={24} />
          Verification
        </h2>
        <p className="mt-1 text-sm text-slate-400">Review artist badge requests.</p>
      </div>
      <ul className="space-y-3">
        {(verifications.data?.verifications ?? []).map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-800/40 p-4"
          >
            <span className="text-slate-200">
              {v.artist.name} — {v.requestedBy.email}
            </span>
            <div className="flex gap-2">
              <Button type="button" leadingIcon="check" onClick={() => void approve.mutateAsync(v.id)}>
                Approve
              </Button>
              <Button type="button" variant="ghost" onClick={() => void reject.mutateAsync(v.id)}>
                Reject
              </Button>
            </div>
          </li>
        ))}
        {!verifications.isLoading && (verifications.data?.verifications ?? []).length === 0 && (
          <p className="text-sm text-slate-500">No pending verifications.</p>
        )}
      </ul>
    </div>
  );
}
