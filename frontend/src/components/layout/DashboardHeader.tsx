import { Link } from "react-router-dom";
import { HubIcon } from "../icons/HubIcon";
import { ICON_SIZE } from "../icons/iconDefaults";
import { IconButton } from "../ui/IconButton";
import { UserMenu, UserMenuLogoutButton } from "./UserMenu";
import { BrandLogo } from "./BrandLogo";

type DashboardHeaderProps = {
  onOpenNav?: () => void;
};

export function DashboardHeader({ onOpenNav }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-slate-700/80 bg-slate-900/95 px-4 backdrop-blur md:px-6">
      <IconButton
        icon="menu"
        aria-label="Open menu"
        className="lg:hidden"
        onClick={onOpenNav}
      />

      <BrandLogo to="/dashboard" />

      <Link
        to="/search"
        className="hidden text-sm text-zinc-500 hover:text-zinc-300 sm:inline"
      >
        Explore
      </Link>

      <div className="mx-auto hidden max-w-md flex-1 md:block">
        <label className="sr-only" htmlFor="dashboard-search">
          Search
        </label>
        <div className="relative">
          <HubIcon
            name="search"
            size={ICON_SIZE.sm}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search songs, artists, lyrics…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none"
            onFocus={() => {
              window.location.href = "/search";
            }}
            readOnly
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link to="/create" className="hidden sm:inline-flex">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/30">
            <HubIcon name="create" size={ICON_SIZE.sm} />
            Create
          </span>
        </Link>
        <UserMenuLogoutButton />
        <UserMenu />
      </div>
    </header>
  );
}
