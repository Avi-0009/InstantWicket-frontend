import { Undo2, UserMinus, ChevronRight } from "lucide-react";

interface ScoringPadProps {
  onScore: (runs: number, isWicket?: boolean) => void;
  modifier: "WD" | "NB" | null;
  setModifier: (mod: "WD" | "NB" | null) => void;
  isFreeHit: boolean;
  onRetire: () => void;
  onComplete: () => void;
}

export default function ScoringPad({
  onScore,
  modifier,
  setModifier,
  isFreeHit,
  onRetire,
  onComplete,
}: ScoringPadProps) {
  return (
    <div className="space-y-4">
      {/* Free Hit Alert */}
      {isFreeHit && (
        <div className="py-2 text-center rounded-xl font-black text-xs bg-warning/20 text-warning animate-pulse border border-warning">
          FREE HIT ACTIVE
        </div>
      )}

      {/* Runs Section */}
      <div>
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 px-1">
          Runs
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => onScore(r)}
              className="h-14 bg-card border border-border rounded-xl text-foreground text-lg font-bold hover:bg-card-hover transition-colors"
            >
              {r === 0 ? "•" : r}
            </button>
          ))}
          <button
            onClick={() => onScore(4)}
            className="h-14 bg-card border border-primary rounded-xl text-primary text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-primary/10 transition-colors"
          >
            4
          </button>
          <button
            onClick={() => onScore(6)}
            className="h-14 bg-card border border-primary rounded-xl text-primary text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-primary/10 transition-colors"
          >
            6
          </button>
        </div>
      </div>

      {/* Extras & Wickets */}
      <div>
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 px-1">
          Extras & Wickets
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setModifier(modifier === "WD" ? null : "WD")}
            className={`h-12 border rounded-xl text-xs font-semibold transition-colors ${
              modifier === "WD"
                ? "bg-warning border-warning text-background"
                : "bg-card border-border text-muted-foreground hover:bg-border"
            }`}
          >
            Wide
          </button>
          <button
            onClick={() => setModifier(modifier === "NB" ? null : "NB")}
            className={`h-12 border rounded-xl text-xs font-semibold transition-colors ${
              modifier === "NB"
                ? "bg-warning border-warning text-background"
                : "bg-card border-border text-muted-foreground hover:bg-border"
            }`}
          >
            No Ball
          </button>
          <button className="h-12 bg-card border border-border rounded-xl text-muted-foreground text-xs font-semibold hover:bg-border transition-colors">
            Byes
          </button>
          <button
            onClick={() => onScore(0, true)}
            className="h-12 bg-destructive/10 border border-destructive rounded-xl text-destructive text-xs font-bold shadow-[0_0_15px_rgba(255,107,107,0.15)] hover:bg-destructive/20 transition-colors"
          >
            Wicket
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <button className="h-11 bg-transparent border border-border rounded-xl text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 hover:bg-card transition-colors">
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          onClick={onRetire}
          className="h-11 bg-transparent border border-border rounded-xl text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 hover:bg-card transition-colors"
        >
          <UserMinus className="w-3.5 h-3.5 text-warning" /> Retire
        </button>
        <button
          onClick={onComplete}
          className="h-11 bg-transparent border border-border rounded-xl text-muted-foreground text-xs font-medium flex items-center justify-center gap-2 hover:bg-card transition-colors"
        >
          Summary <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
