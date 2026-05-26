import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../Api/Auth"; // Adjust path if needed

// 🔴 NEW: Define the structure for the player objects we are sending
const matchPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone_no: z.string().optional().or(z.literal("")),
  is_common_player: z.boolean(),
  is_captain: z.boolean(),
  is_wicket_keeper: z.boolean(),
});

export const createMatchSchema = z.object({
  team_a_name: z.string().min(1),
  team_b_name: z.string().min(1),

  // 🔴 FIX: Changed from team_a_player_ids to team_a_players (array of objects)
  team_a_players: z.array(matchPlayerSchema),
  team_b_players: z.array(matchPlayerSchema),

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
      // Zod will now correctly validate the array of objects!
      const validatedPayload = createMatchSchema.parse(payload);

      const response = await api.post("/matches/match", validatedPayload);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      console.log("Match created successfully");
    },
  });
};
