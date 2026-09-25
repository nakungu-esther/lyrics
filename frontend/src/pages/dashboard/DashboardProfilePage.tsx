import { useAuth } from "../../features/auth/AuthContext";

export function DashboardProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <dl className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
          <dt className="text-sm text-zinc-500">Name</dt>
          <dd className="text-sm text-zinc-100">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.displayName ||
              "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
          <dt className="text-sm text-zinc-500">Email</dt>
          <dd className="text-sm text-zinc-100">{user.email}</dd>
        </div>
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between">
          <dt className="text-sm text-zinc-500">Role</dt>
          <dd className="text-sm text-zinc-100">{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}
