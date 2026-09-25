import { AdminTablePage } from "./AdminTablePage";

export function AdminSongsPage() {
  return (
    <AdminTablePage
      title="Songs"
      description="Latest uploads across all artists."
      queryKey={["admin-songs"]}
      path="/api/v1/admin/songs"
      renderRows={(data) => {
        const songs = (data as { songs: { id: string; title: string; genre: string | null; artist?: { name: string } }[] }).songs;
        return (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Artist</th>
                <th className="px-4 py-3 font-medium">Genre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {songs.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">{s.title}</td>
                  <td className="px-4 py-2">{s.artist?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{s.genre ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }}
    />
  );
}
