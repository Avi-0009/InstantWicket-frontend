import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { api } from "../Api/Auth";

interface BatterStats {
  player_id: string;
  player_name: string;
  runs_scored: number;
  balls_played: number;
  fours: number;
  sixes: number;
  is_out: boolean;
}

interface BowlerStats {
  player_id: string;
  player_name: string;
  runs_conceded: number;
  wickets_taken: number;
  overs_bowled: number;
  maidens: number;
}

export default function MatchDetailsPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"Summary" | "Scoreboard">(
    "Summary",
  );
  const [inningsTab, setInningsTab] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchRealMatchData = async () => {
      try {
        const matchRes = await api.get(`/matches/${matchId}`);
        setMatchData(matchRes.data.match || matchRes.data);
      } catch (error) {
        console.error("Failed to fetch match details", error);
      }

      try {
        const liveRes = await api.get(`/scoring/live/${matchId}`);
        if (liveRes.data && Object.keys(liveRes.data).length > 0) {
          setLiveStats(liveRes.data);
          if (liveRes.data.innings_no === 2 && activeTab === "Scoreboard") {
            setInningsTab(2);
          }
        }
      } catch (error) {}

      try {
        const scoreRes = await api.get(`/scoring/scorecard/${matchId}`);
        if (scoreRes.data) setScorecard(scoreRes.data.scorecard || []);
      } catch (error) {}
    };

    fetchRealMatchData();
    const interval = setInterval(fetchRealMatchData, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (!matchData) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center animate-pulse">
        Loading match...
      </div>
    );
  }

  const overs = liveStats ? Math.floor((liveStats.legal_balls || 0) / 6) : 0;
  const balls = liveStats ? (liveStats.legal_balls || 0) % 6 : 0;
  const crr =
    liveStats?.legal_balls > 0
      ? ((liveStats.current_score || 0) / (liveStats.legal_balls / 6)).toFixed(
          2,
        )
      : "0.00";

  const teamAId = matchData?.team_a_id;
  const teamBId = matchData?.team_b_id;
  const tossWinnerId = matchData?.toss_winner_team_id;

  const firstInningsTeamId =
    matchData?.toss_decision === "bat"
      ? tossWinnerId
      : tossWinnerId === teamAId
        ? teamBId
        : teamAId;
  const secondInningsTeamId =
    firstInningsTeamId === teamAId ? teamBId : teamAId;

  const currentBattingTeamId =
    inningsTab === 1 ? firstInningsTeamId : secondInningsTeamId;
  const currentBowlingTeamId =
    inningsTab === 1 ? secondInningsTeamId : firstInningsTeamId;
  const battingTeamName =
    currentBattingTeamId === teamAId
      ? matchData?.team_a_name
      : matchData?.team_b_name;

  const teamPlayers =
    currentBattingTeamId === teamAId
      ? matchData?.team_a_players
      : matchData?.team_b_players;
  const batters: BatterStats[] = (teamPlayers || []).map((p: any) => {
    const stats = scorecard.find((s) => s.player_id === p.id) || {};
    let runs = stats.runs_scored || 0;
    let playedBalls = stats.balls_played || 0;

    if (liveStats?.striker_id === p.id) {
      runs = liveStats.striker_runs || runs;
      playedBalls = liveStats.striker_balls || playedBalls;
    } else if (liveStats?.non_striker_id === p.id) {
      runs = liveStats.non_striker_runs || runs;
      playedBalls = liveStats.non_striker_balls || playedBalls;
    }

    return {
      player_id: p.id,
      player_name: p.name,
      runs_scored: runs,
      balls_played: playedBalls,
      fours: stats.fours || 0,
      sixes: stats.sixes || 0,
      is_out: stats.is_out || false,
    };
  });

  const bowlingTeamPlayers =
    currentBowlingTeamId === teamAId
      ? matchData?.team_a_players
      : matchData?.team_b_players;
  const bowlers: BowlerStats[] = (bowlingTeamPlayers || [])
    .map((p: any) => {
      const stats = scorecard.find((s) => s.player_id === p.id) || {};
      let runs = stats.runs_conceded || 0;
      let wickets = stats.wickets_taken || 0;

      if (liveStats?.bowler_id === p.id) {
        runs = liveStats.bowler_runs || runs;
        wickets = liveStats.bowler_wickets || wickets;
      }
      return {
        player_id: p.id,
        player_name: p.name,
        runs_conceded: runs,
        wickets_taken: wickets,
        overs_bowled: stats.overs_bowled || 0.0,
        maidens: stats.maidens || 0,
      };
    })
    .filter(
      (b: BowlerStats) =>
        b.overs_bowled > 0 ||
        b.runs_conceded > 0 ||
        b.wickets_taken > 0 ||
        liveStats?.bowler_id === b.player_id,
    );

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#F4FFFD] leading-tight">
            {matchData.team_a_name} vs {matchData.team_b_name}
          </h1>
          <p className="text-xs text-[#9FB7B2]">Match Details</p>
        </div>
      </div>

      <div className="p-4">
        {/* MAIN TABS */}
        <div className="flex bg-[#0B1F1B] p-1 rounded-xl border border-[#1B3530] mb-6">
          <button
            onClick={() => setActiveTab("Summary")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "Summary"
                ? "bg-[#0FAF9A]/20 text-[#0FAF9A] shadow-sm"
                : "text-[#9FB7B2] hover:text-[#F4FFFD]"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("Scoreboard")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "Scoreboard"
                ? "bg-[#0FAF9A]/20 text-[#0FAF9A] shadow-sm"
                : "text-[#9FB7B2] hover:text-[#F4FFFD]"
            }`}
          >
            Scoreboard
          </button>
        </div>

        {/* ----------------- SUMMARY TAB ----------------- */}
        {activeTab === "Summary" && (
          <div className="bg-[#0B1F1B] border border-[#1B3530] p-5 rounded-2xl shadow-lg">
            {!liveStats?.innings_id ? (
              <div className="text-center text-[#9FB7B2] py-8">
                Match has not started yet.
              </div>
            ) : (
              <div className="animate-fade-in text-center">
                <div className="text-sm font-bold text-[#9FB7B2] mb-1 uppercase tracking-wider">
                  {liveStats.innings_no === 1
                    ? firstInningsTeamId === teamAId
                      ? matchData.team_a_name
                      : matchData.team_b_name
                    : secondInningsTeamId === teamAId
                      ? matchData.team_a_name
                      : matchData.team_b_name}{" "}
                  Innings
                </div>
                <div className="text-5xl font-black text-[#F4FFFD] tracking-tight drop-shadow-md">
                  {liveStats.current_score}{" "}
                  <span className="text-2xl text-[#9FB7B2] font-semibold">
                    / {liveStats.wickets}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-4 mt-2 text-sm font-medium">
                  <span className="text-[#9FB7B2]">
                    Overs:{" "}
                    <span className="text-[#0FAF9A] font-bold">
                      {overs}.{balls}
                    </span>
                  </span>
                  <span className="text-[#1B3530]">|</span>
                  <span className="text-[#9FB7B2]">
                    CRR: <span className="text-[#0FAF9A] font-bold">{crr}</span>
                  </span>
                </div>

                {liveStats.target_runs > 0 && (
                  <div className="mt-3 text-xs font-bold text-[#FF6B6B] bg-[#FF6B6B]/10 py-1.5 px-3 rounded-lg inline-block">
                    Target: {liveStats.target_runs}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-6 text-left">
                  <div className="bg-[#0D2420] p-3.5 rounded-xl border border-[#1B3530]/50">
                    <div className="text-[10px] text-[#9FB7B2] font-bold uppercase tracking-wider mb-2">
                      Batters
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-[#F4FFFD] text-sm truncate flex items-center gap-1">
                        {liveStats.striker_name || "Waiting..."}{" "}
                        <span className="text-[#0FAF9A] text-lg leading-none">
                          *
                        </span>
                      </div>
                      <div className="text-[#0FAF9A] text-sm font-bold">
                        {liveStats.striker_runs || 0}{" "}
                        <span className="text-[#9FB7B2] text-xs font-medium">
                          ({liveStats.striker_balls || 0})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-[#9FB7B2] text-sm truncate">
                        {liveStats.non_striker_name || "Waiting..."}
                      </div>
                      <div className="text-[#9FB7B2] text-sm font-medium">
                        {liveStats.non_striker_runs || 0}{" "}
                        <span className="text-xs">
                          ({liveStats.non_striker_balls || 0})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
                    <div className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mb-2">
                      Bowler
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="font-bold text-destructive text-sm truncate">
                        {liveStats.bowler_name || "Waiting..."}
                      </div>
                      <div className="text-destructive text-sm font-black">
                        {liveStats.bowler_wickets || 0}
                        <span className="text-destructive/70 font-medium mx-0.5">
                          -
                        </span>
                        {liveStats.bowler_runs || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- SCOREBOARD TAB ----------------- */}
        {activeTab === "Scoreboard" && (
          <div className="animate-fade-in">
            <div className="flex gap-6 border-b border-[#1B3530] mb-4 px-2">
              <button
                onClick={() => setInningsTab(1)}
                className={`pb-3 text-sm font-bold transition-colors relative ${inningsTab === 1 ? "text-[#0FAF9A]" : "text-[#9FB7B2] hover:text-[#F4FFFD]"}`}
              >
                1st Innings
                {inningsTab === 1 && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0FAF9A] rounded-t-full"></span>
                )}
              </button>
              <button
                onClick={() => setInningsTab(2)}
                className={`pb-3 text-sm font-bold transition-colors relative ${inningsTab === 2 ? "text-[#0FAF9A]" : "text-[#9FB7B2] hover:text-[#F4FFFD]"}`}
              >
                2nd Innings
                {inningsTab === 2 && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0FAF9A] rounded-t-full"></span>
                )}
              </button>
            </div>

            <h3 className="text-[#F4FFFD] font-bold text-sm mb-3 px-1">
              {battingTeamName}
            </h3>

            <div className="overflow-x-auto no-scrollbar mb-4">
              <div className="bg-[#0B1F1B] rounded-xl border border-[#1B3530] overflow-hidden shadow-md min-w-[500px]">
                <div className="bg-[#1B3530]/50 p-2.5 flex items-center text-[11px] text-[#9FB7B2] font-bold uppercase tracking-wider">
                  <div className="w-1/3 min-w-[130px]">Batter</div>
                  <div className="flex-1 text-center">R</div>
                  <div className="flex-1 text-center">B</div>
                  <div className="flex-1 text-center">4s</div>
                  <div className="flex-1 text-center">6s</div>
                  <div className="flex-1 text-right pr-2">SR</div>
                </div>

                <div className="divide-y divide-[#1B3530]/50">
                  {batters.map((batter: BatterStats) => {
                    let statusText = "Yet to bat";
                    let statusColor = "text-[#9FB7B2]";

                    const isStriker =
                      liveStats?.striker_id === batter.player_id;
                    const isNonStriker =
                      liveStats?.non_striker_id === batter.player_id;
                    const isActiveBatter =
                      (isStriker || isNonStriker) &&
                      liveStats?.innings_no === inningsTab;

                    if (batter.is_out) {
                      statusText = "Out";
                      statusColor = "text-destructive";
                    } else if (
                      isActiveBatter ||
                      batter.balls_played > 0 ||
                      batter.runs_scored > 0
                    ) {
                      statusText = "Not out";
                      statusColor = "text-[#0FAF9A]";
                    }

                    const sr =
                      batter.balls_played > 0
                        ? (
                            (batter.runs_scored / batter.balls_played) *
                            100
                          ).toFixed(1)
                        : "0.0";

                    return (
                      <div
                        key={batter.player_id}
                        className="p-2.5 flex items-center text-sm"
                      >
                        <div className="w-1/3 min-w-[130px] font-bold text-[#F4FFFD] flex flex-col justify-center">
                          <span>{batter.player_name}</span>
                          <span
                            className={`text-[10px] ${statusColor} font-normal mt-0.5 leading-none`}
                          >
                            {statusText}
                          </span>
                        </div>
                        <div className="flex-1 text-center font-bold text-[#F4FFFD]">
                          {batter.runs_scored}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.balls_played}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.fours || 0}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.sixes || 0}
                        </div>
                        <div className="flex-1 text-right pr-2 text-[#9FB7B2]">
                          {sr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {bowlers.length > 0 && (
              <div className="overflow-x-auto no-scrollbar">
                <div className="bg-[#0B1F1B] rounded-xl border border-[#1B3530] overflow-hidden shadow-md min-w-[500px]">
                  <div className="bg-[#1B3530]/50 p-2.5 flex items-center text-[11px] text-[#9FB7B2] font-bold uppercase tracking-wider">
                    <div className="w-1/3 min-w-[130px]">Bowler</div>
                    <div className="flex-1 text-center">O</div>
                    <div className="flex-1 text-center">M</div>
                    <div className="flex-1 text-center">R</div>
                    <div className="flex-1 text-center">W</div>
                    <div className="flex-1 text-right pr-2">ECO</div>
                  </div>

                  <div className="divide-y divide-[#1B3530]/50">
                    {bowlers.map((bowler: BowlerStats) => {
                      const bOvers = Math.floor(bowler.overs_bowled);
                      const bBalls = Math.round(
                        (bowler.overs_bowled - bOvers) * 10,
                      );
                      const totalBalls = bOvers * 6 + bBalls;
                      const ecoCalc =
                        totalBalls > 0
                          ? ((bowler.runs_conceded / totalBalls) * 6).toFixed(1)
                          : "0.0";

                      return (
                        <div
                          key={bowler.player_id}
                          className="p-2.5 flex items-center text-sm"
                        >
                          <div className="w-1/3 min-w-[130px] font-bold text-[#F4FFFD]">
                            {bowler.player_name}
                          </div>
                          <div className="flex-1 text-center text-[#9FB7B2]">
                            {bowler.overs_bowled}
                          </div>
                          <div className="flex-1 text-center text-[#9FB7B2]">
                            {bowler.maidens || 0}
                          </div>
                          <div className="flex-1 text-center font-bold text-destructive">
                            {bowler.runs_conceded}
                          </div>
                          <div className="flex-1 text-center font-bold text-[#F4FFFD]">
                            {bowler.wickets_taken}
                          </div>
                          <div className="flex-1 text-right pr-2 text-[#9FB7B2]">
                            {ecoCalc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
