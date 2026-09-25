import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useMyArtist } from "../../features/artist/useMyArtist";
import { IconButton } from "../ui/IconButton";
import { UserMenu } from "./UserMenu";
import { ArtistSidebar } from "./ArtistSidebar";
import { BrandLogo } from "./BrandLogo";

export function ArtistLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: artist } = useMyArtist();

  return (
    <div className="hub-shell-bg flex min-h-screen flex-col text-zinc-100">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-zinc-800/80 bg-[#070714]/90 px-4 backdrop-blur md:px-6">
        <IconButton
          icon="menu"
          aria-label="Open menu"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
        />
        <BrandLogo to="/artist/dashboard" />
        <Link
          to="/dashboard"
          className="hidden text-sm text-zinc-500 hover:text-zinc-300 sm:inline"
        >
          Creator dashboard
        </Link>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-slate-700/80 bg-slate-900/40 p-4 lg:flex lg:flex-col">
          {artist && (
            <p className="mb-4 truncate px-3 text-xs font-medium text-indigo-300/80">{artist.name}</p>
          )}
          <ArtistSidebar className="flex-1" />
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative h-full w-72 max-w-[85vw] border-r border-zinc-800 bg-[#0a0a18] p-4">
              <ArtistSidebar onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
