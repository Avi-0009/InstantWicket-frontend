import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* The Landing Route (Handles Splash -> Dashboard) */}
        <Route path="/" element={<Dashboard />} />

        {/* The Login/Signup Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
