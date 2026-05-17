import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials } from "../utils/helpers";
import {
  Trophy,
  Home as HomeIcon,
  BarChart2,
  Users,
  UserCircle,
  ChevronLeft,
  PlusCircle,
} from "lucide-react";
import { Logout } from "../Api/Auth";

const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (err) {
      console.error(err);
    } finally {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-[#061311] text-[#F4FFFD] font-sans pb-20 md:pb-0">
      {/* Desktop Top Navbar (Hidden on mobile) */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-[#0b1f1b]/85 backdrop-blur-md border-b border-[#1B3530] px-5 h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#0FAF9A]" />
          <span className="text-base font-bold bg-gradient-to-br from-[#0FAF9A] to-[#19F0C1] text-transparent bg-clip-text">
            InstantWicket
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${location.pathname === "/" ? "bg-[#0FAF9A]/20 text-[#0FAF9A]" : "text-[#9FB7B2] hover:bg-[#0FAF9A]/10"}`}
          >
            <HomeIcon className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to="/matches"
            className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer"
          >
            <Trophy className="w-4 h-4" /> Matches
          </Link>
          <Link
            to="/stats"
            className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" /> Stats
          </Link>
          <Link
            to="/players"
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${location.pathname.includes("/players") ? "bg-[#0FAF9A]/20 text-[#0FAF9A]" : "text-[#9FB7B2] hover:bg-[#0FAF9A]/10"}`}
          >
            <Users className="w-4 h-4" /> Players
          </Link>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#F4FFFD] hidden md:block">
              {user.name}
            </span>
            <Link
              to="/settings"
              className="w-8 h-8 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-xs font-bold border border-[#0FAF9A]/30 hover:bg-[#0FAF9A]/40 transition-colors cursor-pointer"
            >
              {getInitials(user.name)}
            </Link>
          </div>
        ) : (
          <Link
            to="/auth"
            className="bg-[#0FAF9A] hover:bg-[#19F0C1] text-[#061311] px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)]"
          >
            <UserCircle className="w-4 h-4" /> Login / Sign Up
          </Link>
        )}
      </nav>

      {/* Dynamic Back Button for Desktop (Optional) */}
      {location.pathname !== "/" && (
        <div className="hidden md:flex px-4 md:px-6 pt-4 max-w-6xl mx-auto w-full">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-[#0B1F1B] border border-[#1B3530] rounded-full text-[#F4FFFD] hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Page Content */}
      <Outlet />

      {/* MOBILE BOTTOM NAVBAR - Hidden on Settings page */}
      {location.pathname !== "/settings" && (
        <div className="fixed bottom-0 w-full bg-[#0b1f1b]/95 backdrop-blur-md border-t border-[#1B3530] py-2 px-2 flex justify-between items-center md:hidden z-50">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 w-[20%] py-1 ${location.pathname === "/" ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* 2. Matches */}
          <Link
            to="/matches"
            className={`flex flex-col items-center gap-1 w-[20%] py-1 ${location.pathname === "/matches" ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium">Matches</span>
          </Link>

          {/* 3. New Match (Primary Action) */}
          <Link
            to="/new-match"
            className="flex flex-col items-center justify-center w-[20%] -mt-6"
          >
            <div className="w-12 h-12 bg-[#0FAF9A] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(15,175,154,0.4)] border-4 border-[#061311] text-[#061311]">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-[#0FAF9A] mt-1">
              Create
            </span>
          </Link>

          {/* 4. Players */}
          <Link
            to="/players"
            className={`flex flex-col items-center gap-1 w-[20%] py-1 ${location.pathname.includes("/players") ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Players</span>
          </Link>

          {/* 5. Stats */}
          <Link
            to="/stats"
            className={`flex flex-col items-center gap-1 w-[20%] py-1 ${location.pathname === "/stats" ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Stats</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
