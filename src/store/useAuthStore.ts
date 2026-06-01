import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStats } from "../hooks/usePlayerQueries";

export interface User {
  id: string;
  name: string;
  phone_no?: string;
  phone?: string;
  batting_style?: string;
  bowling_style?: string;
  player_stats?: PlayerStats;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void; // 🔥 Replaced 'any' with 'User' for strict typing
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,

      login: (userData, token) => {
        set({ user: userData, token, isAuthenticated: true, isGuest: false });
      },

      continueAsGuest: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: true,
        }),

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
        });
      },

      // 🔥 HERE IS THE MISSING IMPLEMENTATION
      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "instantwicket-auth", // Automatically saves your login state to localStorage
    },
  ),
);
