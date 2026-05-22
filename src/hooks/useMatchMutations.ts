import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../Api/Auth";

export const createMatchSchema = z.object({
  team_a_name: z.string().min(1),
  team_b_name: z.string().min(1),
  toss_winner_team_id: z.string(), // "A" or "B"
  toss_decision: z.enum(["bat", "bowl"]),
  allow_common_player: z.boolean(),
  allow_solo_batting: z.boolean(),
  overs_limit: z.number(),
  umpire_id: z.string().optional(),
});

export type CreateMatchPayload = z.infer<typeof createMatchSchema>;

export const createMatchApi = async (payload: CreateMatchPayload) => {
  // Matches your backend route: /matches (POST)
  const response = await api.post("/matches", payload);
  return response.data;
};

export const useCreateMatch = () => {
  return useMutation({
    mutationFn: createMatchApi,
    onSuccess: () => {
      console.log("Match created successfully");
    },
  });
};
