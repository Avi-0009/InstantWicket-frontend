import { create } from "zustand";

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("auth-token") || null,
  isAuthenticated: !!localStorage.getItem("auth-token"),
  isGuest: false,

  // Now requires a token, and saves it to the browser
  login: (userData, token) => {
    localStorage.setItem("auth-token", token);
    set({ user: userData, token, isAuthenticated: true, isGuest: false });
  },

  continueAsGuest: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: true,
    }),

  // Clears the session completely
  logout: () => {
    localStorage.removeItem("auth-token");
    set({ user: null, token: null, isAuthenticated: false, isGuest: false });
  },
}));
