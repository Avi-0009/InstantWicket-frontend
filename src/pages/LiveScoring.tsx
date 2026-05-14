import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
import ScoringPad from "../components/scoring/ScoringPad";

export default function LiveScoring() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#061311] font-sans pb-8">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-50 bg-[#061311]/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-[#1B3530]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-[#9FB7B2] bg-[#0B1F1B] border border-[#1B3530] px-3 py-1.5 rounded-lg hover:text-[#F4FFFD] hover:bg-[#1B3530] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="bg-[#FF6B6B]/15 text-[#FF6B6B] px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border border-[#FF6B6B]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>
          LIVE
        </div>

        {/* Empty div for flexbox centering balance */}
        <div className="w-[70px]"></div>
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
