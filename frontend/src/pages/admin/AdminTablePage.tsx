import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { apiGet } from "../../api/client";
import { Card } from "../../components/ui/Card";

type AdminTablePageProps = {
  title: string;
  description: string;
  queryKey: string[];
  path: string;
  renderRows: (data: unknown) => ReactNode;
};

export function AdminTablePage({ title, description, queryKey, path, renderRows }: AdminTablePageProps) {
  const q = useQuery({
    queryKey,
    queryFn: () => apiGet<unknown>(path),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {q.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {q.isError && <p className="text-sm text-amber-400">Could not load data.</p>}
      {q.data != null ? <Card className="overflow-x-auto">{renderRows(q.data)}</Card> : null}
    </div>
  );
}
