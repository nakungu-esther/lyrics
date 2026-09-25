import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import {
  USER_DASHBOARD_MORE,
  USER_DASHBOARD_PRIMARY,
} from "../../lib/dashboardNav";
import { HubIcon } from "../icons/HubIcon";
import { Button } from "../ui/Button";

function navClass(isActive: boolean) {
  return [
    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
      : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
  ].join(" ");
}

type DashboardSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({ onNavigate, className = "" }: DashboardSidebarProps) {
  const { user } = useAuth();
  const isArtist = user?.role === "ARTIST" || user?.role === "ADMIN";

  return (
    <nav className={`flex h-full flex-col gap-1 ${className}`} aria-label="Dashboard">
      {USER_DASHBOARD_PRIMARY.map(({ to, label, end, icon }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => navClass(isActive)}>
          <HubIcon name={icon} size={18} className="opacity-90" />
          {label}
        </NavLink>
      ))}

<p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Library
      </p>
      {USER_DASHBOARD_MORE.map(({ to, label, end, icon }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => navClass(isActive)}>
          <HubIcon name={icon} size={18} className="opacity-90" />
          {label}
        </NavLink>
      ))}

      {isArtist && (
        <NavLink
          to="/artist/dashboard"
          onClick={onNavigate}
          className={({ isActive }) => `${navClass(isActive)} mt-2 border border-dashed border-slate-700/80`}
        >
          <HubIcon name="artist" size={18} />
          Artist dashboard
        </NavLink>
      )}

      {!isArtist && (
        <NavLink
          to="/artist/create"
          onClick={onNavigate}
          className="mt-2 rounded-xl border border-dashed border-slate-700 px-3 py-2.5 text-sm text-indigo-300 hover:border-indigo-500/40"
        >
          Become an artist
        </NavLink>
      )}

      <Link to="/create" onClick={onNavigate} className="mt-auto block pt-4">
        <Button type="button" className="w-full" leadingIcon="create">
          Create New
        </Button>
      </Link>
    </nav>
  );
}
