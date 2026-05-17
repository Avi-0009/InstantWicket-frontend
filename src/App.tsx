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

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes WITH the layout (Contains Bottom Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/players" element={<PlayersListPage />} />
          <Route path="/player-stats" element={<PlayerStatsPage />} />
          <Route path="/matches" element={<MatchesListPage />} />
          <Route path="/match/:id" element={<MatchDetailsPage />} />
        </Route>

        {/* Routes WITHOUT the layout (Full screen pages) */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/match/live" element={<LiveScoring />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
