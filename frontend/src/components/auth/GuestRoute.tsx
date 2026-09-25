import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { LoadingScreen } from "./LoadingScreen";

/** Redirect authenticated users away from login/register. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Loading…" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
