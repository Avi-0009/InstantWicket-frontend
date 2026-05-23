import { Undo2, UserMinus, ChevronRight } from "lucide-react";

interface ScoringPadProps {
  onScore: (runs: number, isWicket?: boolean) => void;
  modifier: "WD" | "NB" | null;
  setModifier: (mod: "WD" | "NB" | null) => void;
  isFreeHit: boolean;
}

export default function ScoringPad({
  onScore,
  modifier,
  setModifier,
  isFreeHit,
}: ScoringPadProps) {
  return (
    <div className="space-y-4">
      {/* Free Hit Alert */}
      {isFreeHit && (
        <div className="py-2 text-center rounded-xl font-black text-xs bg-[#F59E0B]/20 text-[#F59E0B] animate-pulse border border-[#F59E0B]">
          FREE HIT ACTIVE
        </div>
      )}

      {/* Runs Section */}
      <div>
        <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-2 px-1">
          Runs
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => onScore(r)}
              className="h-14 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#F4FFFD] text-lg font-bold hover:bg-[#1B3530] transition-colors"
            >
              {r === 0 ? "•" : r}
            </button>
          ))}
          <button
            onClick={() => onScore(4)}
            className="h-14 bg-[#0D2420] border border-[#0FAF9A] rounded-xl text-[#0FAF9A] text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-[#0FAF9A]/10 transition-colors"
          >
            4
          </button>
          <button
            onClick={() => onScore(6)}
            className="h-14 bg-[#0D2420] border border-[#0FAF9A] rounded-xl text-[#0FAF9A] text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-[#0FAF9A]/10 transition-colors"
          >
            6
          </button>
        </div>
      </div>

      {/* Extras & Wickets */}
      <div>
        <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-2 px-1">
          Extras & Wickets
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setModifier(modifier === "WD" ? null : "WD")}
            className={`h-12 border rounded-xl text-xs font-semibold transition-colors ${modifier === "WD" ? "bg-[#F59E0B] border-[#F59E0B] text-[#061311]" : "bg-[#0D2420] border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530]"}`}
          >
            Wide
          </button>
          <button
            onClick={() => setModifier(modifier === "NB" ? null : "NB")}
            className={`h-12 border rounded-xl text-xs font-semibold transition-colors ${modifier === "NB" ? "bg-[#F59E0B] border-[#F59E0B] text-[#061311]" : "bg-[#0D2420] border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530]"}`}
          >
            No Ball
          </button>
          <button className="h-12 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-semibold hover:bg-[#1B3530] transition-colors">
            Byes
          </button>
          <button
            onClick={() => onScore(0, true)}
            className="h-12 bg-[#3A1616] border border-[#FF6B6B] rounded-xl text-[#FF6B6B] text-xs font-bold shadow-[0_0_15px_rgba(255,107,107,0.15)] hover:bg-[#4A1D1D] transition-colors"
          >
            Wicket
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          <UserMinus className="w-3.5 h-3.5 text-[#F59E0B]" /> Retire
        </button>
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          Summary <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
