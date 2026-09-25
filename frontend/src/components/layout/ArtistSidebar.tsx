import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { ARTIST_DASHBOARD_NAV } from "../../lib/dashboardNav";
import { HubIcon } from "../icons/HubIcon";
import { Button } from "../ui/Button";

export function ArtistSidebar({
  onNavigate,
  className = "",
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={`flex h-full flex-col gap-1 ${className}`} aria-label="Artist">
      {ARTIST_DASHBOARD_NAV.map(({ to, label, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-indigo-600/25 text-indigo-100"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
            ].join(" ")
          }
        >
          <HubIcon name={icon} size={18} className="opacity-90" />
          {label}
        </NavLink>
      ))}
      <Link to="/dashboard" onClick={onNavigate} className="mt-2 text-xs text-slate-500 hover:text-slate-300 px-3">
        ← Creator dashboard
      </Link>
      <Link to="/create" onClick={onNavigate} className="mt-auto block pt-4">
        <Button type="button" className="w-full" leadingIcon="create">
          Create New
        </Button>
      </Link>
    </nav>
  );
}
