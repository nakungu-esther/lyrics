import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAudioProcessingStatus,
  retryAudioProcessing,
} from "../../api/songs";
import { songKeys } from "./queryKeys";

export function useAudioProcessingStatus(songId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: songKeys.processing(songId ?? ""),
    queryFn: () => fetchAudioProcessingStatus(songId!),
    enabled: Boolean(songId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "QUEUED" || status === "PROCESSING") return 2000;
      return false;
    },
  });
}

export function useRetryAudioProcessing(songId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => retryAudioProcessing(songId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: songKeys.processing(songId) });
      void queryClient.invalidateQueries({ queryKey: songKeys.detail(songId) });
    },
  });
}
