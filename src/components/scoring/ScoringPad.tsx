import { UserMinus, AlertTriangle, UserX, RotateCcw } from "lucide-react";

interface ScoringPadProps {
  onScore: (runs: number, isWicket?: boolean) => void;
  modifier: "WD" | "NB" | "BYE" | "LB" | null;
  setModifier: (mod: "WD" | "NB" | "BYE" | "LB" | null) => void;
  isFreeHit: boolean;
  onComplete: () => void;
  onRetire: () => void;
  onUndo: () => void;
  isCooldown: boolean;
}

export default function ScoringPad({
  onScore,
  modifier,
  setModifier,
  isFreeHit,
  onComplete,
  onRetire,
  onUndo,
  isCooldown,
}: ScoringPadProps) {
  // 🔥 FIX: 6 runs removed for BYE and LB as well
  const availableRuns =
    modifier === "WD" || modifier === "BYE" || modifier === "LB"
      ? [0, 1, 2, 3, 4]
      : [0, 1, 2, 3, 4, 6];

  const handleScore = (run: number) => {
    if (isCooldown) return;
    onScore(run, false);
  };

  const handleWicket = () => {
    if (isCooldown) return;
    onScore(0, true);
  };

  const handleModifier = (type: "WD" | "NB" | "BYE" | "LB") => {
    if (isCooldown) return;
    setModifier(modifier === type ? null : type);
  };

  return (
    <div
      className={`bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-sm transition-all duration-200 ${isCooldown ? "opacity-50 pointer-events-none grayscale-[20%]" : ""}`}
    >
      <div className="grid grid-cols-4 gap-2 mb-4">
        {["WD", "NB", "BYE", "LB"].map((mod) => (
          <button
            key={mod}
            onClick={() => handleModifier(mod as any)}
            className={`flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
              modifier === mod
                ? "bg-[#0FAF9A] text-background shadow-md scale-[0.98]"
                : "bg-background border border-border text-[#9FB7B2] hover:text-[#F4FFFD] hover:border-[#1B3530]"
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {isFreeHit && (
        <div className="flex-1 flex items-center justify-center gap-1.5 mb-4 py-3 rounded-xl bg-warning/20 border border-warning/30 text-warning font-black text-xs uppercase tracking-widest animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          Free Hit
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
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

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleWicket}
          className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-background transition-all font-bold uppercase tracking-wider text-[10px] active:scale-95"
        >
          <UserMinus className="w-4 h-4" />
          Wicket
        </button>

        <button
          onClick={() => {
            if (!isCooldown) onRetire();
          }}
          className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-background border border-border text-[#9FB7B2] hover:text-[#F4FFFD] transition-all font-bold uppercase tracking-wider text-[10px] active:scale-95"
        >
          <UserX className="w-4 h-4" />
          Retire
        </button>

        <button
          onClick={() => {
            if (!isCooldown) onUndo();
          }}
          className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-background border border-border text-[#9FB7B2] hover:text-[#F4FFFD] transition-all font-bold uppercase tracking-wider text-[10px] active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </button>

        <button
          onClick={onComplete}
          className="py-3 rounded-xl bg-[#0FAF9A] text-[#0B1F1B] font-black uppercase tracking-wider text-[10px] hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          End Innings
        </button>
      </div>
    </div>
  );
}
