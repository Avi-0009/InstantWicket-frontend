import { useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import LiveScoring from "./pages/LiveScoring";
import SettingsPage from "./pages/SettingsPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";
import PlayersListPage from "./pages/PlayerListPage";
import MatchesListPage from "./pages/MatchesListPage";
import MatchDetailsPage from "./pages/MatchDetailsPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NewMatchPage from "./pages/NewMatchPage";
import { useThemeStore } from "./store/useThemeStore";

// Extracted a small fallback component to utilize NavLink instead of Navigate redirect
const NotFoundFallback = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2 className="text-(--foreground) text-xl font-bold mb-4">
      404 - Page Not Found
    </h2>
    <NavLink
      to="/"
      style={{
        color: "var(--primary)",
        textDecoration: "underline",
        fontWeight: "bold",
      }}
    >
      Go back to Dashboard
    </NavLink>
  </div>
);

const App = () => {
  const { theme } = useThemeStore();

  // This listens for theme changes and updates the actual HTML tag dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 1000,
          // Updated to use CSS variables so toasts match Light/Dark mode!
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "var(--primary)",
              secondary: "var(--background)",
            },
          },
        }}
      />

      <Routes>
        {/* PUBLIC ROUTES WITH NAVBAR */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<PlayersListPage />} />
          <Route path="/player_stats/:id" element={<PlayerStatsPage />} />
          <Route path="/matches" element={<MatchesListPage />} />
          <Route path="/match/:id" element={<MatchDetailsPage />} />

          {/* PROTECTED ROUTE WITH NAVBAR (Settings) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* PUBLIC ROUTE (Auth/Login) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* PROTECTED ROUTES WITHOUT NAVBAR (Full Screen Actions) */}
        <Route
          path="/new-match"
          element={
            <ProtectedRoute>
              <NewMatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match/live"
          element={
            <ProtectedRoute>
              <LiveScoring />
            </ProtectedRoute>
          }
        />
        <Route path="/matches/:matchId/score" element={<LiveScoring />} />

        {/* Fallback for unknown routes using NavLink */}
        <Route path="*" element={<NotFoundFallback />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
