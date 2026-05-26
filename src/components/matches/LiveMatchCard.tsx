import { Play } from "lucide-react";
import { NavLink } from "react-router-dom";

// Accept the real match data object
interface LiveMatchCardProps {
  match: any;
}

const LiveMatchCard = ({ match }: LiveMatchCardProps) => {
  return (
    <div className="bg-linear-to-br from-card to-card-hover border border-border rounded-[14px] p-4 relative cursor-pointer hover:border-primary/40 transition-colors">
      {/* Live Badge */}
      {match.status === "ongoing" && (
        <div className="absolute top-3 right-3 bg-destructive/15 text-destructive px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-destructive animate-pulse inline-block"></span>
          LIVE
        </div>
      )}

      {/* Teams and Main Score */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold uppercase">
          {match.team_a_name ? match.team_a_name.substring(0, 3) : "TBA"}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {match.team_a_name || "Team A"}
          </div>
          <div className="text-2xl font-bold text-primary">
            {match.score || 0}
            <span className="text-base text-muted-foreground">
              /{match.wickets || 0}
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">
            {match.overs || "0.0"} ov
          </div>
          <div className="text-xs text-primary-hover">
            CRR: {match.crr || "0.0"}
          </div>
        </div>
      </div>

      {/* Match Situation / Target */}
      <div className="bg-card-hover rounded-lg p-2.5 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Target: {match.target || 0}
          </span>
          <span className="text-primary-hover font-semibold">
            {match.target
              ? `Need ${match.target - (match.score || 0)} runs`
              : "1st Innings"}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden my-1.5">
          <div
            className="h-full bg-linear-to-r from-primary to-primary-hover rounded-full"
            style={{
              width: match.target
                ? `${((match.score || 0) / match.target) * 100}%`
                : "0%",
            }}
          ></div>
        </div>
        <div className="text-muted-foreground">
          RRR: {match.rrr || "0.0"} | {match.balls_left || 0} balls left
        </div>
      </div>

      {/* Players and Action Button */}
      <div className="flex justify-between items-center text-xs">
        <div>
          <div className="text-muted-foreground">Striker</div>
          <div className="font-medium">
            {match.striker_name || "Waiting..."}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Bowler</div>
          <div className="font-medium">{match.bowler_name || "Waiting..."}</div>
        </div>

        {/* Dynamically routes to the exact match ID */}
        <NavLink
          to={`/matches/${match.id}/score`}
          onClick={(e) => e.stopPropagation()}
          className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-muted-foreground flex items-center gap-1 hover:text-primary hover:border-primary transition-colors"
        >
          <Play className="w-3.5 h-3.5" /> Score
        </NavLink>
      </div>
    </div>
  );
};

export default LiveMatchCard;
