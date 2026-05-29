import { Play } from "lucide-react";
import { NavLink } from "react-router-dom";

interface LiveMatchCardProps {
  match: any;
}

const LiveMatchCard = ({ match }: LiveMatchCardProps) => {
  const totalBalls = match.legal_balls || 0;
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  const oversDisplay = `${overs}.${balls}`;

  const crr =
    totalBalls > 0
      ? ((match.score || 0) / (totalBalls / 6)).toFixed(2)
      : "0.00";

  let rrr = "0.00";
  let ballsLeft = 0;

  if (match.target && match.overs_limit) {
    const maxBalls = match.overs_limit * 6;
    ballsLeft = maxBalls - totalBalls;
    const runsNeeded = match.target - (match.score || 0);

    if (ballsLeft > 0 && runsNeeded > 0) {
      rrr = (runsNeeded / (ballsLeft / 6)).toFixed(2);
    }
  }

  return (
    <div className="bg-linear-to-br from-card to-card-hover border border-border rounded-[14px] p-4 relative cursor-pointer hover:border-primary/40 transition-colors">
      {match.status === "ongoing" && (
        <div className="absolute top-3 right-3 bg-destructive/15 text-destructive px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-destructive animate-pulse inline-block"></span>
          LIVE
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold uppercase">
          {match.team_a_name ? match.team_a_name.substring(0, 3) : "TBA"}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {match.team_a_name}{" "}
            <span className="text-muted-foreground text-xs font-normal">v</span>{" "}
            {match.team_b_name}
          </div>
          <div className="text-2xl font-bold text-primary mt-0.5">
            {match.score || 0}
            <span className="text-base text-muted-foreground">
              /{match.wickets || 0}
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs font-medium text-muted-foreground">
            {oversDisplay} ov
          </div>
          <div className="text-[11px] font-bold text-primary-hover mt-0.5">
            CRR: {crr}
          </div>
        </div>
      </div>

      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-lg p-2.5 mb-3 text-xs shadow-inner">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[#9FB7B2] font-medium">
            {match.target ? `Target: ${match.target}` : "1st Innings"}
          </span>
          <span className="text-primary font-bold">
            {match.target && (match.score || 0) < match.target
              ? `Need ${match.target - (match.score || 0)} runs`
              : match.target && (match.score || 0) >= match.target
                ? "Target Reached!"
                : ""}
          </span>
        </div>

        <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-linear-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full transition-all duration-500"
            style={{
              width: match.target
                ? `${Math.min(((match.score || 0) / match.target) * 100, 100)}%`
                : "0%",
            }}
          ></div>
        </div>

        {match.target ? (
          <div className="flex justify-between text-[11px] text-[#9FB7B2]">
            <span>RRR: {rrr}</span>
            <span>{ballsLeft} balls left</span>
          </div>
        ) : (
          <div className="text-[11px] text-[#9FB7B2]">
            Setting the target...
          </div>
        )}
      </div>

      <div className="flex justify-between items-end text-xs mt-3 border-t border-[#1B3530]/50 pt-3">
        <div className="flex gap-6">
          {/* Batters */}
          <div>
            <div className="text-[#9FB7B2] text-[10px] font-bold uppercase tracking-wider mb-1">
              Batters
            </div>
            <div className="font-bold text-[#F4FFFD] flex items-center gap-1">
              {match.striker_name || "Waiting..."}{" "}
              <span className="text-[#0FAF9A]">*</span>
            </div>
            <div className="font-medium text-[#9FB7B2] mt-0.5">
              {match.non_striker_name || "Waiting..."}
            </div>
          </div>

          {/* Bowler */}
          <div>
            <div className="text-destructive/70 text-[10px] font-bold uppercase tracking-wider mb-1">
              Bowler
            </div>
            <div className="font-bold text-destructive">
              {match.bowler_name || "Waiting..."}
            </div>
          </div>
        </div>

        <NavLink
          to={`/matches/${match.id}/score`}
          onClick={(e) => e.stopPropagation()}
          className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 font-bold text-primary flex items-center gap-1.5 hover:bg-primary hover:text-background transition-colors"
        >
          <Play className="w-3.5 h-3.5" fill="currentColor" /> Score
        </NavLink>
      </div>
    </div>
  );
};

export default LiveMatchCard;
