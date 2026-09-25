import { NavLink } from "react-router-dom";
import { HubIcon, type HubIconName } from "../icons/HubIcon";

const items: { to: string; label: string; icon: HubIconName; end: boolean }[] = [
  { to: "/dashboard", label: "Home", icon: "home", end: true },
  { to: "/create", label: "Create", icon: "create", end: false },
  { to: "/dashboard/templates", label: "Templates", icon: "templates", end: false },
  { to: "/dashboard/playlists", label: "Lists", icon: "playlists", end: false },
  { to: "/dashboard/settings", label: "Settings", icon: "settings", end: false },
];

export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-zinc-800/80 bg-[#0a0a18]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Mobile"
    >
      {items.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] ${
              isActive ? "text-blue-400" : "text-slate-500"
            }`
          }
        >
          <HubIcon name={icon} size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
