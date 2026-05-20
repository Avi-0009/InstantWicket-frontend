import { create } from "zustand";

interface MatchWizardState {
  step: number;
  matchType: string;
  customOvers: string;

  teamA: string;
  teamB: string;

  captainA: string;
  captainB: string;
  umpire1: string;
  umpire2: string;
  allowSolo: boolean;
  allowCommon: boolean;
  draftTossWinner: string | null;
  matchTossWinner: string | null;
  matchTossDecision: "bat" | "bowl" | null;

  setStep: (step: number) => void;
  setField: <K extends keyof MatchWizardState>(
    field: K,
    value: MatchWizardState[K],
  ) => void;
}

export const useMatchWizardStore = create<MatchWizardState>((set) => ({
  step: 1,
  matchType: "T20",
  customOvers: "",

  teamA: "",
  teamB: "",

  captainA: "",
  captainB: "",
  umpire1: "",
  umpire2: "",
  allowSolo: false,
  allowCommon: false,
  draftTossWinner: null,
  matchTossWinner: null,
  matchTossDecision: null,

  setStep: (step) => set({ step }),
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
}));
