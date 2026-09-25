import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function DashboardLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const isStudio =
    location.pathname.startsWith("/studio/") ||
    location.pathname === "/create" ||
    location.pathname === "/lrc-studio";
  const wide = isStudio;

  return (
    <div className="hub-shell-bg flex min-h-screen flex-col text-zinc-100">
      <DashboardHeader onOpenNav={() => setMobileNavOpen(true)} />

      <div className="flex flex-1 pb-16 lg:pb-0">
        <aside className="hidden w-60 shrink-0 border-r border-slate-700/80 bg-slate-900/40 p-4 lg:flex lg:flex-col">
          <DashboardSidebar className="flex-1" />
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-700 bg-slate-900 p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Menu</span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/5"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Close
                </button>
              </div>
              <DashboardSidebar onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 md:p-8 md:pb-8">
          <div className={wide ? "mx-auto max-w-[1600px]" : "mx-auto max-w-6xl"}>
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
