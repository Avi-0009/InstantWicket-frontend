import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SplashScreen from "../components/SplashScreen";
import {
  Trophy,
  Home as HomeIcon,
  History,
  BarChart2,
  Users,
  Activity,
  TrendingUp,
  Zap,
  Play,
  UserCircle,
} from "lucide-react";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading the app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Shows splash screen for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

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
          <div className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 bg-[#0FAF9A]/20 text-[#0FAF9A] cursor-pointer">
            <HomeIcon className="w-4 h-4" /> Dashboard
          </div>
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

        {/* Guest Login Button */}
        <Link
          to="/auth"
          className="bg-[#0FAF9A] hover:bg-[#19F0C1] text-[#061311] px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)]"
        >
          <UserCircle className="w-4 h-4" /> Login / Sign Up
        </Link>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#F4FFFD]">Dashboard</h1>
            <p className="text-sm text-[#9FB7B2]">
              Welcome! Here's what's happening today.
            </p>
          </div>
          <button className="bg-[#0FAF9A] text-[#061311] border-none rounded-lg px-6 py-3 text-sm font-bold flex items-center gap-2 w-full md:w-auto justify-center hover:bg-[#19F0C1] transition-colors">
            <Trophy className="w-4 h-4" /> Start New Match
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="text-3xl font-bold">148</div>
            <div className="text-xs text-[#9FB7B2] mt-1">Total Matches</div>
            <div className="text-[10px] text-[#22C55E] mt-1">+12 this week</div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-[#818CF8]" />
            </div>
            <div className="text-3xl font-bold">3</div>
            <div className="text-xs text-[#9FB7B2] mt-1">Live Now</div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B6B]" />
            </div>
            <div className="text-3xl font-bold">24,810</div>
            <div className="text-xs text-[#9FB7B2] mt-1">Total Runs</div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="text-3xl font-bold">87</div>
            <div className="text-xs text-[#9FB7B2] mt-1">Active Players</div>
          </div>
        </div>

        {/* ... [Rest of your Dashboard JSX remains exactly the same: Matches Grid, Popular Players, etc.] ... */}
      </main>

      {/* Bottom Nav - Mobile */}
      <div className="fixed bottom-0 w-full bg-[#0b1f1b]/95 backdrop-blur-md border-t border-[#1B3530] py-2 flex justify-around md:hidden z-50">
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A]">
          <div className="w-6 h-[3px] bg-[#0FAF9A] rounded-full mb-0.5"></div>
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Match</span>
        </div>
        {/* Mobile Login Button trigger */}
        <Link
          to="/auth"
          className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A] pt-2 bg-[#0FAF9A]/10 rounded-xl"
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold">Login</span>
        </Link>
      </div>
    </div>
  );
}
