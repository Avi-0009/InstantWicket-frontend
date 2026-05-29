import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // Defaulting to your clean dark theme layout
      setTheme: (theme) => {
        set({ theme });
        updateDOMTheme(theme);
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";
          updateDOMTheme(nextTheme);
          return { theme: nextTheme };
        }),
    }),
    {
      name: "instantwicket-theme-storage",
    },
  ),
);

// Helper to keep DOM sync side-effects isolated from rendering logic
const updateDOMTheme = (theme: "light" | "dark") => {
  if (typeof window !== "undefined") {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }
};
