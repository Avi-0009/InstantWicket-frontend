import { UserMinus, AlertTriangle } from "lucide-react";

interface ScoringPadProps {
  onScore: (runs: number, isWicket?: boolean) => void;
  modifier: "WD" | "NB" | null;
  setModifier: (mod: "WD" | "NB" | null) => void;
  isFreeHit: boolean;
  onComplete: () => void;
  onRetire: () => void;
  isCooldown: boolean; // 🔥 Added for debounce lock
}

export default function ScoringPad({
  onScore,
  modifier,
  setModifier,
  isFreeHit,
  onComplete,
  onRetire,
  isCooldown,
}: ScoringPadProps) {
  // 🔥 Limit runs if WD is selected (Wides can't be hit for 6 off the bat)
  const availableRuns =
    modifier === "WD" ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];

  const handleScore = (run: number) => {
    if (isCooldown) return;
    onScore(run, false);
  };

  const handleWicket = () => {
    if (isCooldown) return;
    onScore(0, true); // Opens wicket form
  };

  const handleModifier = (type: "WD" | "NB") => {
    if (isCooldown) return;
    setModifier(modifier === type ? null : type);
  };

  return (
    <div
      className={`bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-sm transition-all duration-200 ${isCooldown ? "opacity-50 pointer-events-none grayscale-[20%]" : ""}`}
    >
      {/* Modifiers & Extras Row */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleModifier("WD")}
          className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            modifier === "WD"
              ? "bg-[#0FAF9A] text-background shadow-md scale-[0.98]"
              : "bg-background border border-border text-[#9FB7B2] hover:text-[#F4FFFD] hover:border-[#1B3530]"
          }`}
        >
          WD
        </button>
        <button
          onClick={() => handleModifier("NB")}
          className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            modifier === "NB"
              ? "bg-warning text-background shadow-md scale-[0.98]"
              : "bg-background border border-border text-[#9FB7B2] hover:text-[#F4FFFD] hover:border-[#1B3530]"
          }`}
        >
          NB
        </button>
        {isFreeHit && (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-warning/20 border border-warning/30 text-warning font-black text-xs uppercase tracking-widest animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            Free Hit
          </div>
        )}
      </div>

      {/* Main Runs Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {availableRuns.map((run) => (
          <button
            key={`run-${run}`}
            onClick={() => handleScore(run)}
            className={`py-5 rounded-xl font-black text-xl transition-all border ${
              run === 0
                ? "bg-[#1B3530]/50 text-[#9FB7B2] border-transparent hover:bg-[#1B3530]"
                : run === 4 || run === 6
                  ? "bg-[#0FAF9A]/10 text-[#0FAF9A] border-[#0FAF9A]/30 hover:bg-[#0FAF9A]/20"
                  : "bg-background border-border text-[#F4FFFD] hover:bg-border/50"
            } active:scale-95`}
          >
            {run === 0 ? "•" : run}
          </button>
        ))}
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleWicket}
          className="flex items-center justify-center gap-2 py-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-background transition-all font-black uppercase tracking-widest text-sm active:scale-95"
        >
          <UserMinus className="w-5 h-5" />
          Wicket
        </button>

        <button
          onClick={onComplete}
          className="py-4 rounded-xl bg-primary text-background font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          End Innings
        </button>
      </div>
    </div>
  );
}
