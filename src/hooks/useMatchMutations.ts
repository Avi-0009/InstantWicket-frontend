// src/hooks/useMatchMutations.ts
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "../Api/Auth";

// This schema now perfectly matches your Go backend's 'StartLiveMatchRequest' struct
export const createMatchSchema = z.object({
  team_a_name: z.string().min(1, "Team A name is required"),
  team_b_name: z.string().min(1, "Team B name is required"),
  toss_winner_team_id: z.enum(["A", "B"]), // Backend expects "A" or "B" for the TossWinner field
  toss_decision: z.enum(["bat", "bowl"]),
  allow_common_player: z.boolean(),
  allow_solo_batting: z.boolean(),
  overs_limit: z.number().min(1, "Overs must be at least 1"),
  umpire_id: z.string().uuid().optional().or(z.literal("")),
});

export type CreateMatchPayload = z.infer<typeof createMatchSchema>;

export const createMatchApi = async (payload: CreateMatchPayload) => {
  const validData = createMatchSchema.parse(payload);
  // Remember your backend endpoint includes /v1 based on your previous requirement
  const response = await api.post("/v1/matches", validData);
  return response.data;
};

export const useCreateMatch = () => {
  return useMutation({
    mutationFn: createMatchApi,
    onSuccess: (data) => {
      console.log("Match created successfully", data);
    },
    onError: (error) => {
      console.error("Match creation failed", error);
    },
  });
};
