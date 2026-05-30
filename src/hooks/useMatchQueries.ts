import { useQuery } from "@tanstack/react-query";
import { api } from "../Api/Auth";

export const fetchMatchesApi = async (page: number = 1, limit: number = 10) => {
  const response = await api.get("/matches", {
    params: { page, limit },
  });
  return response.data;
};

// 2. Add them to the hook and the queryKey
export const useMatches = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["matches", page, limit],
    queryFn: () => fetchMatchesApi(page, limit),
    placeholderData: (previousData) => previousData, // Prevents flickering
  });
};

// Example of a hook that fetches a single match by ID
export const fetchSingleMatchApi = async (matchId: string) => {
  const response = await api.get(`/matches/${matchId}`);
  return response.data;
};

export const useSingleMatch = (matchId: string) => {
  return useQuery({
    queryKey: ["match", matchId], // Caches uniquely per match ID
    queryFn: () => fetchSingleMatchApi(matchId),
    enabled: !!matchId, // Only run the query if a matchId actually exists
  });
};
