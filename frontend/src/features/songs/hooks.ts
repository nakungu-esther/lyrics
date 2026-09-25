import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSong,
  deleteSong,
  fetchArtistAlbums,
  fetchArtistSongs,
  fetchSong,
  updateSong,
} from "../../api/songs";
import { artistKeys } from "../artist/queryKeys";
import type { CreateSongInput, UpdateSongInput } from "./types";
import { songKeys } from "./queryKeys";

export function useArtistSongs() {
  return useQuery({
    queryKey: songKeys.list,
    queryFn: fetchArtistSongs,
  });
}

export function useSong(id: string | undefined) {
  return useQuery({
    queryKey: songKeys.detail(id ?? ""),
    queryFn: () => fetchSong(id!),
    enabled: Boolean(id),
  });
}

export function useArtistAlbums() {
  return useQuery({
    queryKey: songKeys.albums,
    queryFn: fetchArtistAlbums,
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSongInput) => createSong(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: songKeys.list });
      await queryClient.invalidateQueries({ queryKey: artistKeys.dashboard });
    },
  });
}

export function useUpdateSong(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSongInput) => updateSong(id, input),
    onSuccess: async (song) => {
      queryClient.setQueryData(songKeys.detail(id), song);
      await queryClient.invalidateQueries({ queryKey: songKeys.list });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSong(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: songKeys.list });
      await queryClient.invalidateQueries({ queryKey: artistKeys.dashboard });
    },
  });
}
