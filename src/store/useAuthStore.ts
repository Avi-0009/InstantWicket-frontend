import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
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
    }),
    {
      name: "instantwicket-auth", // Automatically saves your login state to localStorage
    },
  ),
);
