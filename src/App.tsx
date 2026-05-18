import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import ProtectedRoute from "./components/common/ProtectedRoute"; // <-- Import it here
import NewMatchPage from "./pages/NewMatchPage";

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

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
