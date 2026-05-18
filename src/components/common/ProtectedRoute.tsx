import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  // If the user is NOT logged in, redirect them to the Auth page immediately
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If they ARE logged in, render the requested page
  return <>{children}</>;
};

export default ProtectedRoute;
