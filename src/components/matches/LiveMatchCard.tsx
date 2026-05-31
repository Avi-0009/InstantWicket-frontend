import { Play, Trophy, ChevronRight, User, ShieldAlert } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore"; // 👈 Adjust path if needed!

interface LiveMatchCardProps {
  match: any;
}

const LiveMatchCard = ({ match }: LiveMatchCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // 👈 Bring in the logged-in user

  const isCompleted = match.status === "completed";
  const isOngoing = match.status === "ongoing";

  // 🛡️ AUTHORIZATION CHECK: Are they the host or the umpire?
  const isAuthorizedToScore =
    user && (match.created_by === user.id || match.umpire_id === user.id);

  const formatOvers = (balls: number) => {
    const overs = Math.floor((balls || 0) / 6);
    const remainingBalls = (balls || 0) % 6;
    return `${overs}.${remainingBalls}`;
  };

  // Determine Match Winner Text
  let resultText = "";
  if (isCompleted) {
    if (match.winner_team_id) {
      resultText =
        match.winner_team_id === match.team_a_id
          ? `${match.team_a_name} won the match`
          : `${match.team_b_name} won the match`;
    } else {
      resultText = "Match Tied / Drawn";
    }
  }

  // Determine Toss Text
  const tossWinnerName =
    match.toss_winner_team_id === match.team_a_id
      ? match.team_a_name
      : match.team_b_name;
  const tossText = match.toss_winner_team_id
    ? `${tossWinnerName} won the toss and elected to ${match.toss_decision}`
    : "Toss not decided";

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-linear-to-br from-card to-card-hover border border-border rounded-[14px] p-4 relative cursor-pointer hover:border-primary/40 transition-colors flex flex-col h-full group"
    >
      {/* Match Status & Overs */}
      <div className="flex justify-between items-center mb-4">
        {isOngoing ? (
          <div className="bg-destructive/15 text-destructive px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 w-max">
            <span className="w-1 h-1 rounded-full bg-destructive animate-pulse inline-block"></span>
            LIVE
          </div>
        ) : isCompleted ? (
          <div className="bg-primary/15 text-primary px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 w-max">
            <Trophy className="w-3 h-3" />
            COMPLETED
          </div>
        ) : (
          <div className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-[11px] font-bold w-max">
            UPCOMING
          </div>
        )}
        <div className="text-xs text-muted-foreground font-medium">
          {match.overs_limit} Overs Match
        </div>
      </div>

      {/* Scores Section - Shows both teams always */}
      <div className="flex justify-between items-center mb-4">
        {/* Team A */}
        <div className="flex-1">
          <div
            className="font-semibold text-sm truncate max-w-[120px]"
            title={match.team_a_name}
          >
            {match.team_a_name}
          </div>
          <div className="text-2xl font-bold text-foreground mt-0.5">
            {match.team_a_score || 0}
            <span className="text-base text-muted-foreground font-medium">
              /{match.team_a_wickets || 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            ({formatOvers(match.team_a_balls)})
          </div>
        </div>

        <div className="px-3 text-xs font-bold text-muted-foreground bg-muted/30 rounded-full py-1">
          VS
        </div>

        {/* Team B */}
        <div className="flex-1 text-right">
          <div
            className="font-semibold text-sm truncate max-w-[120px ml-auto]"
            title={match.team_b_name}
          >
            {match.team_b_name}
          </div>
          <div className="text-2xl font-bold text-foreground mt-0.5">
            {match.team_b_score || 0}
            <span className="text-base text-muted-foreground font-medium">
              /{match.team_b_wickets || 0}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            ({formatOvers(match.team_b_balls)})
          </div>
        </div>
      </div>

      {/* Main Result Banner */}
      <div
        className={`rounded-lg p-2.5 mb-3 text-xs shadow-inner font-medium text-center ${isCompleted ? "bg-primary/10 text-primary border border-primary/20" : "bg-[#0B1F1B] border border-[#1B3530] text-[#9FB7B2]"}`}
      >
        {isCompleted ? resultText : tossText}
      </div>

      {/* Target Chase Progress Bar (2nd Innings Only) */}
      {isOngoing && match.target > 0 && (
        <div className="mb-3 bg-[#0D2420] border border-[#1B3530]/70 rounded-xl p-3 shadow-sm text-left">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-[#9FB7B2] font-medium">
              Target: {match.target}
            </span>
            <span className="text-[#0FAF9A] font-bold">
              Need {Math.max(0, match.target - (match.score || 0))} runs
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#1B3530] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[#0FAF9A] transition-all duration-500 ease-in-out rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, ((match.score || 0) / match.target) * 100))}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#9FB7B2] font-medium">
            <span>
              RRR:{" "}
              {match.overs_limit * 6 - (match.legal_balls || 0) > 0
                ? (
                    (Math.max(0, match.target - (match.score || 0)) /
                      (match.overs_limit * 6 - (match.legal_balls || 0))) *
                    6
                  ).toFixed(2)
                : "0.00"}
            </span>
            <span>
              {Math.max(0, match.overs_limit * 6 - (match.legal_balls || 0))}{" "}
              balls left
            </span>
          </div>
        </div>
      )}

      {/* Metadata Section: Toss, Umpire, Creator */}
      <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground mt-2 mb-3 bg-muted/20 p-2.5 rounded-lg border border-border/50">
        {isCompleted && (
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/50">
            <span className="font-semibold text-foreground/70">Toss:</span>{" "}
            {tossText}
          </div>
        )}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-1 truncate" title="Umpire">
            <ShieldAlert className="w-3 h-3 text-primary/70" />
            <span className="truncate max-w-[100px]">
              {match.umpire_name || "Self/None"}
            </span>
          </div>
          <div className="flex items-center gap-1 truncate" title="Created By">
            <User className="w-3 h-3 text-primary/70" />
            <span className="truncate max-w-[100px]">
              {match.creator_name || "Organizer"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="mt-auto pt-2 border-t border-border flex justify-between items-center">
        {isOngoing ? (
          <div className="text-xs font-medium text-[#0FAF9A] animate-pulse">
            Match in progress...
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Match final.</div>
        )}

        {/* 🏏 THE FIX: Conditional rendering for the Action Button */}
        {isOngoing && isAuthorizedToScore ? (
          <NavLink
            to={`/matches/${match.id}/score`}
            onClick={(e) => e.stopPropagation()} // Prevents the outer card click from firing
            className="shrink-0 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 font-bold text-primary flex items-center gap-1.5 hover:bg-primary hover:text-background transition-colors text-xs relative z-10"
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" /> Score
          </NavLink>
        ) : (
          <div className="shrink-0 text-muted-foreground text-xs font-bold flex items-center gap-1">
            {isOngoing ? "View Match" : "View Stats"}{" "}
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchCard;
