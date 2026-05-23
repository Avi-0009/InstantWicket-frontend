import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../Api/Auth"; // Adjust path if needed

export const createMatchSchema = z.object({
  team_a_name: z.string().min(1),
  team_b_name: z.string().min(1),
  team_a_player_ids: z.array(z.string()),
  team_b_player_ids: z.array(z.string()),
  toss_winner_team_id: z.string(),
  toss_decision: z.enum(["bat", "bowl"]),
  allow_common_player: z.boolean(),
  allow_solo_batting: z.boolean(),
  overs_limit: z
    .number()
    .int()
    .min(1, "Overs must be at least 1")
    .max(50, "Overs cannot exceed 50"),
  umpire_id: z.string().optional().or(z.literal("")),
});

export type CreateMatchPayload = z.infer<typeof createMatchSchema>;

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMatchPayload) => {
      const validatedPayload = createMatchSchema.parse(payload);

      // ✅ FIX: Dropped the "/v1" since it's already in your env/baseURL.
      // This will correctly resolve to http://localhost:8080/v1/matches/match
      const response = await api.post("/matches/match", validatedPayload);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      console.log("Match created successfully");
    },
  });
};
