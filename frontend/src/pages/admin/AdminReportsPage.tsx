import { AdminTablePage } from "./AdminTablePage";

export function AdminReportsPage() {
  return (
    <AdminTablePage
      title="Reports"
      description="User and content reports."
      queryKey={["admin-reports"]}
      path="/api/v1/admin/reports"
      renderRows={(data) => {
        const reports = (data as { reports: { id: string; reason: string; status: string; createdAt: string }[] }).reports;
        return (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.reason}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }}
    />
  );
}
