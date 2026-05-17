import { useState, useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
import LiveMatchCard from "../components/matches/LiveMatchCard";
import { Trophy, Activity, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

let hasSeenSplashThisSession = false;

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(!hasSeenSplashThisSession);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!hasSeenSplashThisSession) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        hasSeenSplashThisSession = true;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 max-w-6xl mx-auto pb-24"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#F4FFFD]">
            InstantWicket
          </h1>
          <p className="text-sm text-[#9FB7B2]">
            Welcome! Here's what's happening today.
          </p>
        </div>
        <button className="bg-[#0FAF9A] text-[#061311] border-none rounded-lg px-6 py-3 text-sm font-bold flex items-center gap-2 w-full md:w-auto justify-center hover:bg-[#19F0C1] transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)]">
          <Trophy className="w-4 h-4" /> Start New Match
        </button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveTab("Recent")}
          className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 cursor-pointer hover:border-[#0FAF9A]/50 transition-colors shadow-lg"
        >
          <Trophy className="w-5 h-5 text-[#F59E0B] mb-2" />
          <div className="text-3xl font-bold">148</div>
          <div className="text-xs text-[#9FB7B2] mt-1">Total Matches</div>
        </div>
        <div
          onClick={() => setActiveTab("Live")}
          className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 cursor-pointer hover:border-[#0FAF9A]/50 transition-colors shadow-lg"
        >
          <Activity className="w-5 h-5 text-[#818CF8] mb-2" />
          <div className="text-3xl font-bold">3</div>
          <div className="text-xs text-[#9FB7B2] mt-1">Live Now</div>
        </div>
        <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 shadow-lg">
          <TrendingUp className="w-5 h-5 text-[#FF6B6B] mb-2" />
          <div className="text-3xl font-bold">24,810</div>
          <div className="text-xs text-[#9FB7B2] mt-1">Total Runs</div>
        </div>
        <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 shadow-lg">
          <Users className="w-5 h-5 text-[#3B82F6] mb-2" />
          <div className="text-3xl font-bold">87</div>
          <div className="text-xs text-[#9FB7B2] mt-1">Active Players</div>
        </div>
      </div>

      {/* Match Tabs */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0FAF9A]" /> Matches
        </h2>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {["All", "Live", "Upcoming", "Recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-[#0FAF9A]/20 text-[#0FAF9A]"
                  : "text-[#9FB7B2] hover:bg-[#1B3530]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(activeTab === "All" || activeTab === "Live") && (
          <>
            <div className="w-full col-span-1 md:col-span-2 text-xs font-semibold text-[#9FB7B2] uppercase tracking-[0.06em] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>{" "}
              Live Matches
            </div>
            <LiveMatchCard />
            <LiveMatchCard />
          </>
        )}
      </div>
    </motion.main>
  );
}
