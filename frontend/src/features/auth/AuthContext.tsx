import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  registerRequest,
} from "../../api/auth";
import { getAccessToken, setAccessToken } from "../../api/client";
import { authKeys } from "./queryKeys";
import { useCurrentUser } from "./useCurrentUser";
import type { AuthUser } from "./types";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  const applySession = useCallback(
    (user: AuthUser, accessToken: string) => {
      setAccessToken(accessToken);
      queryClient.setQueryData(authKeys.me, user);
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: authKeys.all });
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    const data = await refreshSessionRequest();
    applySession(data.user, data.accessToken);
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshSession();
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession, clearSession]);

  const meQuery = useCurrentUser({
    enabled: bootstrapped && Boolean(getAccessToken()),
  });

  useEffect(() => {
    if (bootstrapped && meQuery.isError && getAccessToken()) {
      clearSession();
    }
  }, [bootstrapped, meQuery.isError, clearSession]);

  const user = meQuery.data ?? null;
  const isLoading =
    !bootstrapped ||
    (Boolean(getAccessToken()) && meQuery.isLoading && !meQuery.data);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email, password);
      applySession(data.user, data.accessToken);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    [applySession, queryClient],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
    ) => {
      const data = await registerRequest({ email, password, firstName, lastName });
      applySession(data.user, data.accessToken);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    [applySession, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) {
        await logoutRequest();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      refreshSession,
      logout,
    }),
    [user, isLoading, login, register, refreshSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
