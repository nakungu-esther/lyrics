import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { Button } from "../ui/Button";

function displayLabel(firstName: string | null | undefined, email: string): string {
  if (firstName?.trim()) return firstName.trim();
  return email.split("@")[0] ?? "Account";
}

function initials(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  if (a || b) return `${a}${b}`.toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!user) return null;

  const name = displayLabel(user.firstName, user.email);

  async function onLogout() {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 text-sm hover:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/30 text-xs font-semibold text-violet-200">
            {initials(user.firstName, user.lastName, user.email)}
          </span>
        )}
        <span className="hidden max-w-[8rem] truncate text-zinc-200 sm:inline">
          {name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-xl"
        >
          <Link
            role="menuitem"
            to="/dashboard/profile"
            className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            role="menuitem"
            to="/dashboard/settings"
            className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900"
            onClick={() => void onLogout()}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function UserMenuLogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      className="hidden lg:inline-flex"
      onClick={() => {
        void logout().then(() => navigate("/login", { replace: true }));
      }}
    >
      Log out
    </Button>
  );
}
