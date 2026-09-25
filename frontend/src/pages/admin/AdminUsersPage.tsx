import { AdminTablePage } from "./AdminTablePage";

export function AdminUsersPage() {
  return (
    <AdminTablePage
      title="Users"
      description="Registered accounts (latest 100)."
      queryKey={["admin-users"]}
      path="/api/v1/admin/users"
      renderRows={(data) => {
        const users = (data as { users: { email: string; role: string; displayName: string | null; createdAt: string }[] }).users;
        return (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-700 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {users.map((u) => (
                <tr key={u.email}>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.displayName ?? "—"}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
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
