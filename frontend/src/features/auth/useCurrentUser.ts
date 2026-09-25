import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../../api/auth";
import { ApiError, getAccessToken } from "../../api/client";
import { authKeys } from "./queryKeys";

export function useCurrentUser(options?: { enabled?: boolean }) {
  const token = getAccessToken();
  const enabled = options?.enabled ?? Boolean(token);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) return false;
      return failureCount < 1;
    },
  });
}
