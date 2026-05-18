// src/components/matches/MatchSummaryHero.tsx
import { getOvers } from "../../utils/helpers"; // Or just keep the helper in this file if you prefer

// You can move these types to a types file later
interface Innings {
  total_runs: number;
  total_wickets: number;
  legal_balls: number;
  target_runs?: number;
}

interface MatchInfo {
  status: string;
  teamA: string;
  teamB: string;
  toss: string;
  innings: Innings[];
}

export default function MatchSummaryHero({
  matchInfo,
}: {
  matchInfo: MatchInfo;
}) {
  return (
    <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
      <div className="text-center mb-6">
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-widest">
          {matchInfo.status === "upcoming"
            ? "Match Not Started"
            : matchInfo.toss}
        </span>
      </div>

      <div className="flex justify-between items-center px-2 md:px-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            {matchInfo.teamA}
          </h2>
          {matchInfo.status !== "upcoming" && matchInfo.innings[0] && (
            <p className="text-primary text-xl font-bold">
              {matchInfo.innings[0].total_runs}/
              {matchInfo.innings[0].total_wickets}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                ({getOvers(matchInfo.innings[0].legal_balls)})
              </span>
            </p>
          )}
        </div>

        <div className="text-muted-foreground font-bold text-lg px-4">VS</div>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            {matchInfo.teamB}
          </h2>
          {matchInfo.status !== "upcoming" && matchInfo.innings[1] && (
            <p className="text-primary text-xl font-bold">
              {matchInfo.innings[1].total_runs}/
              {matchInfo.innings[1].total_wickets}
              <span className="text-sm text-muted-foreground font-normal ml-1">
                ({getOvers(matchInfo.innings[1].legal_balls)})
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Status Footer */}
      {matchInfo.status === "ongoing" && matchInfo.innings[1] && (
        <div className="mt-6 text-center text-destructive font-bold text-sm bg-destructive/10 py-2 rounded-lg border border-destructive/20">
          {matchInfo.teamB} need{" "}
          {matchInfo.innings[1].target_runs! - matchInfo.innings[1].total_runs}{" "}
          runs in {120 - matchInfo.innings[1].legal_balls} balls
        </div>
      )}
    </div>
  );
}
