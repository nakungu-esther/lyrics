import { useQuery } from "@tanstack/react-query";
import { fetchMyArtist } from "../../api/artists";
import { artistKeys } from "./queryKeys";

export function useMyArtist(enabled = true) {
  return useQuery({
    queryKey: artistKeys.me,
    queryFn: fetchMyArtist,
    enabled,
  });
}
