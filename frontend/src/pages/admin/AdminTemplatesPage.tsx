import { AdminTablePage } from "./AdminTablePage";

export function AdminTemplatesPage() {
  return (
    <AdminTablePage
      title="Templates"
      description="Seeded lyric video template configs."
      queryKey={["admin-templates"]}
      path="/api/v1/admin/templates"
      renderRows={(data) => {
        const templates = (data as { templates: { slug: string; name: string; isActive: boolean }[] }).templates;
        return (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {templates.map((t) => (
                <tr key={t.slug}>
                  <td className="px-4 py-2">{t.name}</td>
                  <td className="px-4 py-2 text-slate-500">{t.slug}</td>
                  <td className="px-4 py-2">{t.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }}
    />
  );
}
