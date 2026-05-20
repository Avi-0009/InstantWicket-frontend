import { api } from "./Auth";

export const getPlayerById = async (playerId: string) => {
  const response = await api.get(`/players/${playerId}`); // Adjust the route to match your Go backend
  return response.data;
};
