import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { ADMIN_NAV } from "../../lib/dashboardNav";
import { HubIcon } from "../icons/HubIcon";
import { BrandLogo } from "./BrandLogo";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-1" aria-label="Admin">
      <div className="mb-6 px-1">
        <BrandLogo to="/admin" />
        <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Platform admin
        </p>
      </div>
      {ADMIN_NAV.map(({ to, label, end, icon }) => (
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
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-slate-300"
      >
        <HubIcon name="home" size={16} />
        Exit to creator dashboard
      </Link>
    </nav>
  );
}
