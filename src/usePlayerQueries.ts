import { useQuery } from "@tanstack/react-query";
import { api } from "./Api/Auth";

export interface Player {
  id: string;
  user_id: string;
  name: string;
  batting_style: string;
  bowling_style: string;
  career_matches: number;
}

interface PlayersResponse {
  players: Player[];
  total: number;
}

// Arrow function to fetch paginated/searched players
export const fetchPlayersApi = async (
  page: number,
  limit: number,
  search: string,
): Promise<PlayersResponse> => {
  const response = await api.get("/players", {
    params: { page, limit, search }, // Axios handles building the ?page=1&limit=8 URL automatically
  });
  return response.data;
};

// TanStack Hook for paginated players list
export const usePlayers = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ["players", page, limit, search],
    queryFn: () => fetchPlayersApi(page, limit, search),
    // placeholderData keeps the previous page's data on screen while the next page fetches (prevents UI flickering)
    placeholderData: (previousData) => previousData,
  });
};

// Moving your old getPlayerById logic here
export const fetchPlayerByIdApi = async (playerId: string) => {
  const response = await api.get(`/players/${playerId}`);
  return response.data;
};

export const usePlayerById = (playerId: string) => {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayerByIdApi(playerId),
    enabled: !!playerId, // Only run if a playerId is provided
  });
};
