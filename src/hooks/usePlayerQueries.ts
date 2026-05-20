import { useQuery } from "@tanstack/react-query";
import { api } from "../Api/Auth";

export interface PlayerStats {
  id: string;
  user_id: string;
  name: string;
  batting_style: string;
  bowling_style: string;
  career_matches: number;
  career_runs: number;
  career_wickets: number;
  career_catches: number;
  career_runouts: number;
  career_stumpings: number;
  career_fours: number;
  career_sixes: number;
  strike_rate: number;
  economy: number;
  career_highest_score: number;
  career_fifties: number;
  career_hundreds: number;
  career_best_bowling_wickets: number;
  career_best_bowling_runs: number;
  career_mvps: number;
  career_total_points: number;
}

// 1. Fetch All Stats
export const fetchAllPlayerStatsApi = async (): Promise<PlayerStats[]> => {
  const response = await api.get("/player_stats");
  return response.data.player_stats || [];
};

// 2. Search Stats
export const searchPlayerStatsApi = async (query: string) => {
  const response = await api.get(`/player_stats/search?q=${query}`);
  return response.data.players || [];
};

// 3. GET SINGLE PLAYER STATS (Matches your Postman!)
export const fetchPlayerStatsByIdApi = async (
  playerId: string,
): Promise<PlayerStats> => {
  // Added the explicit /v1/ to perfectly match your backend route
  const response = await api.get(`/player_stats/${playerId}`);
  // Your Go backend returns gin.H{"player_stats": playerStats}
  return response.data.player_stats;
};

// --- TANSTACK HOOKS ---

export const useAllPlayerStats = () => {
  return useQuery({
    queryKey: ["allPlayerStats"],
    queryFn: fetchAllPlayerStatsApi,
  });
};

export const useSearchPlayerStats = (searchQuery: string) => {
  return useQuery({
    queryKey: ["searchPlayerStats", searchQuery],
    queryFn: () => searchPlayerStatsApi(searchQuery),
    enabled: searchQuery.length > 0,
  });
};

export const usePlayerStats = (playerId: string | undefined) => {
  return useQuery({
    queryKey: ["playerStats", playerId],
    queryFn: async () => {
      if (!playerId) throw new Error("No Player ID provided");
      return await fetchPlayerStatsByIdApi(playerId);
    },
    enabled: !!playerId, // Only run if ID exists
    retry: false, // Prevents infinite loading loops if a player is missing stats
  });
};
