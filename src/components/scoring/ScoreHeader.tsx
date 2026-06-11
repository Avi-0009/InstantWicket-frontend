interface ScoreHeaderProps {
  battingTeam: string;
  score: number;
  wickets: number;
  overs: number;
  // --- NEW PROPS ADDED FOR 2ND INNINGS ---
  target?: number;
  oversLimit?: number;
  legalBalls?: number;
}

export default function ScoreHeader({
  battingTeam,
  score = 0,
  wickets = 0,
  overs = 0,
  target = 0,
  oversLimit = 0,
  legalBalls = 0,
}: ScoreHeaderProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/30 uppercase">
            {battingTeam ? battingTeam.substring(0, 3) : "TBA"}
          </div>
          <div>
            <div className="text-muted-foreground text-xs font-medium mb-0.5">
              {battingTeam || "Batting Team"}
            </div>
            <div className="text-3xl font-bold text-foreground leading-none">
              {score}
              <span className="text-lg text-muted-foreground font-semibold">
                /{wickets}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs font-medium mb-0.5">
            {overs} ov
          </div>
          <div className="text-primary-hover font-bold text-sm tracking-wide">
            CRR:{" "}
            {overs > 0
              ? (
                  score /
                  (Math.floor(overs) + ((overs - Math.floor(overs)) * 10) / 6)
                ).toFixed(2)
              : "0.00"}
          </div>
        </div>
      </div>

      {/* Target & Progress (Dynamic for 1st/2nd Innings) */}
      {target > 0 ? (
        // --- YOUR NEW 2ND INNINGS RUN CHASE UI ---
        <div className="bg-card hover:bg-card-hover border border-border/70 rounded-xl p-3 shadow-sm text-left transition-colors">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-muted-foreground font-medium">
              Target: {target}
            </span>
            <span className="text-primary font-bold">
              Need {Math.max(0, target - score)} runs
            </span>
          </div>

          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, (score / target) * 100))}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
            <span>
              RRR:{" "}
              {oversLimit * 6 - legalBalls > 0
                ? (
                    (Math.max(0, target - score) /
                      (oversLimit * 6 - legalBalls)) *
                    6
                  ).toFixed(2)
                : "0.00"}
            </span>
            <span>{Math.max(0, oversLimit * 6 - legalBalls)} balls left</span>
          </div>
        </div>
      ) : (
        // --- ORIGINAL 1ST INNINGS UI ---
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">1st Innings</span>
            <span className="text-primary-hover">In Progress</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-primary to-primary-text-primary-hover rounded-full w-[0%]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
