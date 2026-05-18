import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials } from "../utils/helpers";
import {
  Trophy,
  Home as HomeIcon,
  BarChart2,
  Users,
  UserCircle,
  PlusCircle,
} from "lucide-react";
import { Logout } from "../Api/Auth";

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (err) {
      console.error(err);
    } finally {
      logout();
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
      isActive
        ? "bg-primary/20 text-primary"
        : "text-muted-foreground hover:bg-primary/10"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 w-[20%] py-1 ${
      isActive ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 md:pb-0">
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border px-5 h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-base font-bold bg-gradient-to-br from-primary to-primary-hover text-transparent bg-clip-text">
            InstantWicket
          </span>
        </div>

        <div className="flex gap-2">
          <NavLink to="/" className={navLinkClass}>
            <HomeIcon className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/matches" className={navLinkClass}>
            <Trophy className="w-4 h-4" /> Matches
          </NavLink>
          <NavLink to="/players" className={navLinkClass}>
            <Users className="w-4 h-4" /> Players
          </NavLink>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground hidden md:block">
              {user.name}
            </span>
            <NavLink
              to="/settings"
              className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/30 hover:bg-primary/40 transition-colors"
            >
              {getInitials(user.name)}
            </NavLink>
          </div>
        ) : (
          <NavLink
            to="/auth"
            className="bg-primary hover:bg-primary-hover text-background px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <UserCircle className="w-4 h-4" /> Login
          </NavLink>
        )}
      </nav>

      {/* Main Page Content */}
      <Outlet />

      {/* MOBILE BOTTOM NAVBAR */}
      {location.pathname !== "/settings" && (
        <div className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border py-2 px-2 flex justify-between items-center md:hidden z-50">
          <NavLink to="/" className={mobileNavLinkClass}>
            <HomeIcon className="w-5 h-5" />{" "}
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>
          <NavLink to="/matches" className={mobileNavLinkClass}>
            <Trophy className="w-5 h-5" />{" "}
            <span className="text-[10px] font-medium">Matches</span>
          </NavLink>
          <NavLink
            to="/new-match"
            className="flex flex-col items-center justify-center w-[20%] -mt-6"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(15,175,154,0.4)] border-4 border-background text-background">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-primary mt-1">
              Create
            </span>
          </NavLink>
          <NavLink to="/players" className={mobileNavLinkClass}>
            <Users className="w-5 h-5" />{" "}
            <span className="text-[10px] font-medium">Players</span>
          </NavLink>

          {isAuthenticated && user ? (
            <NavLink to="/settings" className={mobileNavLinkClass}>
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/30">
                {getInitials(user.name)}
              </div>
              <span className="text-[10px] font-medium">Profile</span>
            </NavLink>
          ) : (
            <NavLink to="/auth" className={mobileNavLinkClass}>
              <UserCircle className="w-5 h-5" />{" "}
              <span className="text-[10px] font-medium">Login</span>
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
