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

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes WITH the layout (Navbars) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
        {/* Routes WITHOUT the layout (Auth) */}
        <Route path="/auth" element={<AuthPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        // Inside App.tsx Routes block:
        <Route path="/match/live" element={<LiveScoring />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/players" element={<PlayersListPage />} />
        <Route path="/player-stats" element={<PlayerStatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
