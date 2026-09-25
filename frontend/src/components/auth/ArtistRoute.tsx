import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useMyArtist } from "../../features/artist/useMyArtist";
import { LoadingScreen } from "./LoadingScreen";

/**
 * UX guard for artist-area routes. Backend still enforces roles and ownership.
 */
export function ArtistRoute({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const artistQuery = useMyArtist(Boolean(user));

  if (authLoading || artistQuery.isLoading) {
    return <LoadingScreen label="Loading artist account…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === "USER" && !artistQuery.data) {
    return <Navigate to="/artist/create" replace />;
  }

  if (!artistQuery.data && user.role !== "ADMIN") {
    return <Navigate to="/artist/create" replace />;
  }

  return children;
}
