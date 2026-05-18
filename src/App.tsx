import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink, // <-- Replaced Navigate with NavLink
} from "react-router-dom";
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

// Extracted a small fallback component to utilize NavLink instead of Navigate redirect
const NotFoundFallback = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h2>404 - Page Not Found</h2>
    <NavLink
      to="/"
      style={{
        color: "var(--primary-color, blue)",
        textDecoration: "underline",
      }}
    >
      Go back to Dashboard
    </NavLink>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES WITH NAVBAR */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<PlayersListPage />} />
          <Route path="/player-stats/:id" element={<PlayerStatsPage />} />
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

        {/* Fallback for unknown routes using NavLink */}
        <Route path="*" element={<NotFoundFallback />} />
      </Routes>
    </Router>
  );
};

export default App;
