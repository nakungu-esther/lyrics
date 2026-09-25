import { NavLink } from "react-router-dom";
import { HubIcon, type HubIconName } from "../icons/HubIcon";

const items: { to: string; label: string; icon: HubIconName; end?: boolean }[] = [
  { to: "/artist/dashboard", label: "Home", icon: "home", end: true },
  { to: "/artist/songs", label: "Songs", icon: "lyrics" },
  { to: "/artist/songs/new", label: "Upload", icon: "upload" },
  { to: "/artist/analytics", label: "Analytics", icon: "analytics" },
  { to: "/artist/profile", label: "Profile", icon: "profile" },
];

export function ArtistMobileBottomNav() {
  return <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-[#090d18]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Artist mobile navigation">
    {items.map(({ to, label, icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] ${isActive ? "text-violet-300" : "text-slate-500"}`}><HubIcon name={icon} size={20} />{label}</NavLink>)}
  </nav>;
}
