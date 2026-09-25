import { useState } from "react";
import { Outlet } from "react-router-dom";
import { IconButton } from "../ui/IconButton";
import { UserMenu } from "./UserMenu";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileBottomNav } from "./AdminMobileBottomNav";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="hub-shell-bg flex min-h-screen text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-700/80 bg-slate-900/50 p-4 lg:block">
        <AdminSidebar />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] border-r border-slate-700 bg-slate-900 p-4">
            <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-slate-700/80 bg-slate-900/90 px-4 md:px-6">
          <IconButton
            icon="menu"
            aria-label="Open admin menu"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          />
          <h1 className="text-sm font-medium text-slate-400">LyricsHub Admin</h1>
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <AdminMobileBottomNav />
      </div>
    </div>
  );
}
