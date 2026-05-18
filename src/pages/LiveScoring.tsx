import { ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";
import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
import ScoringPad from "../components/scoring/ScoringPad";

export default function LiveScoring() {
  return (
    <div className="min-h-screen bg-[#061311] font-sans pb-8">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-50 bg-[#061311]/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#1B3530]">
        {/* UPDATED BACK BUTTON: Replaced useNavigate with NavLink */}
        <NavLink
          to="/"
          className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD] flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </NavLink>

        <div className="bg-[#FF6B6B]/15 text-[#FF6B6B] px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border border-[#FF6B6B]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>
          LIVE
        </div>

        {/* Adjusted empty div for flexbox centering balance to match circular button */}
        <div className="w-10"></div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        <ScoreHeader />
        <PlayerStats />
        <OverTimeline />
        <ScoringPad />
      </main>
    </div>
  );
}
