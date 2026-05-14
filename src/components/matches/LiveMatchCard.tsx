import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LiveMatchCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0B1F1B] to-[#0D2420] border border-[#1B3530] rounded-[14px] p-4 relative cursor-pointer hover:border-[#0FAF9A]/40 transition-colors">
      <div className="absolute top-3 right-3 bg-[#FF6B6B]/15 text-[#FF6B6B] px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>
        LIVE
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-[10px] font-bold">
          RCB
        </div>
        <div>
          <div className="font-semibold text-sm">Royal Challengers</div>
          <div className="text-2xl font-bold text-[#0FAF9A]">
            186<span className="text-base text-[#9FB7B2]">/4</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-[#9FB7B2]">18.3 ov</div>
          <div className="text-xs text-[#19F0C1]">CRR: 10.1</div>
        </div>
      </div>
      <div className="bg-[#0D2420] rounded-lg p-2.5 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-[#9FB7B2]">Target: 201</span>
          <span className="text-[#5FFFD2] font-semibold">Need 15 runs</span>
        </div>
        <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden my-1.5">
          <div className="h-full bg-gradient-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full w-[88%]"></div>
        </div>
        <div className="text-[#9FB7B2]">RRR: 5.4 | 9 balls left</div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <div>
          <div className="text-[#9FB7B2]">Striker</div>
          <div className="font-medium">V. Kohli</div>
        </div>
        <div>
          <div className="text-[#9FB7B2]">Bowler</div>
          <div className="font-medium">B. Kumar</div>
        </div>

        {/* Added the onClick navigation here */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents card clicks from firing if you add them later
            navigate("/match/live");
          }}
          className="bg-transparent border border-[#1B3530] rounded-lg px-3 py-1.5 text-[#9FB7B2] flex items-center gap-1 hover:text-[#0FAF9A] hover:border-[#0FAF9A] transition-colors"
        >
          <Play className="w-3.5 h-3.5" /> Score
        </button>
      </div>
    </div>
  );
}
