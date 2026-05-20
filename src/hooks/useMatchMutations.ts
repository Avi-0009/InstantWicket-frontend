import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../Api/Auth"; // Assuming your axios instance is exported from here

// 1. Zod schema matching your Go backend models.CreateMatch exactly
export const createMatchSchema = z.object({
  team_a_id: z.string().uuid("Invalid Team A ID"),
  team_b_id: z.string().uuid("Invalid Team B ID"),
  toss_winner_team_id: z.string().uuid("Invalid Toss Winner ID"),
  toss_decision: z.enum(["bat", "bowl"]),
  allow_common_player: z.boolean(),
  allow_solo_batting: z.boolean(),
  overs_limit: z.number().min(1, "Overs must be at least 1"),
  umpire_id: z.string().uuid().optional(),
});

export type CreateMatchPayload = z.infer<typeof createMatchSchema>;

// 2. TanStack Query Mutation Hook
export const useCreateMatch = () => {
  return useMutation({
    mutationFn: async (payload: CreateMatchPayload) => {
      // Zod validation before sending to backend
      const validData = createMatchSchema.parse(payload);
      const response = await api.post("/matches", validData);
      return response.data;
    },
  });
};
