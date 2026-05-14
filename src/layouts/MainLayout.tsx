import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getInitials } from "../utils/helpers";
import {
  Trophy,
  Home as HomeIcon,
  History,
  BarChart2,
  Users,
  UserCircle,
} from "lucide-react";

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#061311] text-[#F4FFFD] font-sans pb-20 md:pb-0">
      {/* Top Navbar */}
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
            className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 bg-[#0FAF9A]/20 text-[#0FAF9A]"
          >
            <HomeIcon className="w-4 h-4" /> Dashboard
          </Link>
          <div className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer">
            <Trophy className="w-4 h-4" /> New Match
          </div>
          <div className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer">
            <History className="w-4 h-4" /> History
          </div>
          <div className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer">
            <BarChart2 className="w-4 h-4" /> Stats
          </div>
          <div className="px-3 py-2 rounded-lg text-sm text-[#9FB7B2] flex items-center gap-2 hover:bg-[#0FAF9A]/10 cursor-pointer">
            <Users className="w-4 h-4" /> Players
          </div>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#F4FFFD] hidden md:block">
              {user.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-xs font-bold border border-[#0FAF9A]/30">
              {getInitials(user.name)}
            </div>
            <button
              onClick={logout}
              className="text-xs text-[#FF6B6B] hover:text-[#ff8f8f] font-semibold ml-2 transition-colors"
            >
              Logout
            </button>
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

      {/* Page Content goes here */}
      <Outlet />

      {/* Bottom Nav - Mobile */}
      <div className="fixed bottom-0 w-full bg-[#0b1f1b]/95 backdrop-blur-md border-t border-[#1B3530] py-2 flex justify-around md:hidden z-50">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A]"
        >
          <div className="w-6 h-[3px] bg-[#0FAF9A] rounded-full mb-0.5"></div>
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Match</span>
        </div>
        {isAuthenticated && user ? (
          <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A] pt-2">
            <div className="w-5 h-5 rounded-full bg-[#0FAF9A]/20 flex items-center justify-center text-[10px] font-bold border border-[#0FAF9A]/30">
              {getInitials(user.name)}
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A] pt-2 bg-[#0FAF9A]/10 rounded-xl"
          >
            <UserCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
