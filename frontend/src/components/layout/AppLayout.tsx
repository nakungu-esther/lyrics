import { Link, Outlet, useLocation } from "react-router-dom";

import { HubIcon } from "../icons/HubIcon";

import { Button } from "../ui/Button";

import { NotificationBell } from "../notifications/NotificationBell";

import { useAuth } from "../../features/auth/AuthContext";

import { BrandLogo } from "./BrandLogo";



const PUBLIC_NAV = [

  { to: "/", label: "Home" },

  { to: "/search", label: "Explore" },

  { to: "/#templates", label: "Templates" },

  { to: "/#pricing", label: "Pricing" },

  { to: "/search", label: "Help" },

] as const;



export function AppLayout() {

  const { user, logout, isLoading } = useAuth();

  const location = useLocation();

  const isHome = location.pathname === "/";



  return (

    <div className="hub-shell-bg min-h-screen text-slate-100">

      <header

        className={`sticky top-0 z-40 ${isHome ? "hub-header-transparent absolute inset-x-0" : "hub-header-glass"}`}

      >

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">

          <BrandLogo />



          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">

            {PUBLIC_NAV.map(({ to, label }) => (

              <Link

                key={label}

                to={to}

                className="text-slate-300 transition hover:text-white"

              >

                {label}

              </Link>

            ))}

          </nav>



          <nav className="flex items-center gap-2 text-sm md:gap-3">

            {!isLoading && user ? (

              <>

                <Link to="/dashboard" className="hidden text-slate-300 hover:text-white sm:inline">

                  Dashboard

                </Link>

                <Link to="/create">

                  <Button type="button" size="sm" leadingIcon="create">

                    Create

                  </Button>

                </Link>

                {user.role === "ADMIN" && (

                  <Link

                    to="/admin"

                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white"

                  >

                    <HubIcon name="users" size={16} />

                    Admin

                  </Link>

                )}

                <NotificationBell />

                <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>

                  Log out

                </Button>

              </>

            ) : (

              !isLoading && (

                <>

                  <Link to="/login" className="px-2 text-slate-200 hover:text-white">

                    Login

                  </Link>

                  <Link to="/register">

                    <Button type="button" size="sm">

                      Sign Up

                    </Button>

                  </Link>

                </>

              )

            )}

          </nav>

        </div>

      </header>



      <main className={isHome ? "pt-0" : "mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10"}>

        <Outlet />

      </main>

    </div>

  );

}

