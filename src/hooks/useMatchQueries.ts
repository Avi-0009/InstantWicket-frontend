import { useQuery } from "@tanstack/react-query";
import { api } from "../Api/Auth";

// Arrow function for the API call
export const fetchMatchesApi = async () => {
  const response = await api.get("/matches");
  return response.data;
};

// TanStack Query Hook for GET requests
export const useMatches = () => {
  return useQuery({
    queryKey: ["matches"], // The unique key TanStack uses to cache this data
    queryFn: fetchMatchesApi,
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
