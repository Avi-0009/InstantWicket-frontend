import { z } from "zod";

// Regex Rules
const teamNameRegex = /^[a-zA-Z0-9\s]+$/; // Only letters, numbers, and spaces
const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits

export const step1Schema = z
  .object({
    matchType: z.enum(["T20", "ODI", "T10", "Custom"]),
    customOvers: z.string().optional(),
  })
  .refine((data) => {
    if (data.matchType === "Custom") {
      const num = parseInt(data.customOvers || "0", 10);
      return num >= 1 && num <= 50;
    }
    return true;
  });

export const step2Schema = z
  .object({
    teamA: z.string().min(2).regex(teamNameRegex),
    teamB: z.string().min(2).regex(teamNameRegex),
  })
  .refine(
    (data) =>
      data.teamA.trim().toLowerCase() !== data.teamB.trim().toLowerCase(),
    {
      message: "Teams cannot have the exact same name",
    },
  );

export const step3Schema = z
  .object({
    captainA: z.object({ id: z.string(), name: z.string() }).nullable(),
    captainB: z.object({ id: z.string(), name: z.string() }).nullable(),
  })
  .refine((data) => data.captainA !== null && data.captainB !== null);

export const guestPlayerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone_no: z.string().regex(phoneRegex, "Phone must be exactly 10 digits"),
});
