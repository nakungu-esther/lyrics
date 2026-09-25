import { AdminTablePage } from "./AdminTablePage";

export function AdminArtistsPage() {
  return (
    <AdminTablePage
      title="Artists"
      description="Artist profiles on the platform."
      queryKey={["admin-artists"]}
      path="/api/v1/admin/artists"
      renderRows={(data) => {
        const artists = (data as { artists: { id: string; name: string; slug: string; owner?: { email: string } }[] }).artists;
        return (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {artists.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2 text-slate-500">{a.slug}</td>
                  <td className="px-4 py-2">{a.owner?.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }}
    />
  );
}
