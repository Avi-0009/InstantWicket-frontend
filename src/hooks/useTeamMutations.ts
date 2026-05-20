import { useMutation } from "@tanstack/react-query";
import { api } from "../Api/Auth";

export const createTeamApi = async (name: string) => {
  // Stripped prefix here as well (ensure "/teams" or "/team" matches your Go router)
  const response = await api.post("/teams", { name });
  return response.data;
};

export const useCreateTeam = () => {
  return useMutation({ mutationFn: createTeamApi });
};
