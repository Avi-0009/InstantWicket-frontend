interface PlayerStatsProps {
  strikerName: string;
  strikerRuns: number;
  strikerBalls: number;
  nonStrikerName: string;
  nonStrikerRuns: number;
  nonStrikerBalls: number;
  bowlerName: string;
  bowlerRuns: number;
  bowlerWickets: number;
  bowlerBalls: number;
  partnershipRuns?: number;
  partnershipBalls?: number;
}

export default function PlayerStats({
  strikerName,
  strikerRuns,
  strikerBalls,
  nonStrikerName,
  nonStrikerRuns,
  nonStrikerBalls,
  bowlerName,
  bowlerRuns,
  bowlerWickets,
  bowlerBalls,
}: PlayerStatsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Striker */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Striker
          </div>
          <div className="text-sm font-bold text-foreground">
            {strikerName || "Pick Striker"}{" "}
            <span className="text-lg text-primary leading-none">*</span>
          </div>
          <div className="text-xs text-primary font-medium mt-0.5">
            {strikerRuns} ({strikerBalls})
          </div>
        </div>

        {/* Non-Striker */}
        <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Non-Striker
          </div>
          <div className="text-sm font-bold text-foreground">
            {nonStrikerName || "Pick Non-Striker"}
          </div>
          <div className="text-xs text-primary font-medium mt-0.5">
            {nonStrikerRuns} ({nonStrikerBalls})
          </div>
        </div>
      </div>

      {/* Bowler */}
      <div className="bg-muted/50 rounded-xl p-3 border border-border/50 flex justify-between items-center">
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
            Bowler
          </div>
          <div className="text-sm font-bold text-foreground">
            {bowlerName || "Pick Bowler"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-primary font-bold text-sm leading-none">
            {bowlerWickets}/{bowlerRuns}
          </div>
          <div className="text-xs text-muted-foreground font-medium mt-1">
            ({Math.floor((bowlerBalls || 0) / 6)}.{(bowlerBalls || 0) % 6} ov)
          </div>
        </div>
      </div>
    </div>
  );
}
