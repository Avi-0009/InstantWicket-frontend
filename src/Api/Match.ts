import { api } from "./Auth"; // Your configured axios instance

export const createMatchApi = async (matchData: any) => {
  const response = await api.post("/matches", matchData);
  return response.data;
};
