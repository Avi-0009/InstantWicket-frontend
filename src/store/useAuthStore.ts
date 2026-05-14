import { create } from "zustand";

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (userData: User) => void;
  logout: () => void;
  continueAsGuest: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,

  // Called when a user successfully logs in or signs up
  login: (userData) =>
    set({
      user: userData,
      isAuthenticated: true,
      isGuest: false,
    }),

  // Called when a user clicks "View Live Scores" from the Auth Page
  continueAsGuest: () =>
    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
    }),

  // Clears the session
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
    }),
}));
