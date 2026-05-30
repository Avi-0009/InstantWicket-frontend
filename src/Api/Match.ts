import { api } from "./Auth"; // Your configured axios instance

export const createMatchApi = async (matchData: any) => {
  const response = await api.post("/matches/match", matchData);
  return response.data;
};
