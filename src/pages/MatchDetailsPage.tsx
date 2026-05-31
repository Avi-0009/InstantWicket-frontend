import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../Api/Auth";
import { FullScreenEvent } from "../components/scoring/FullScreenEvent";
import OverTimeline from "../components/scoring/OverTimeline";

interface BatterStats {
  player_id: string;
  player_name: string;
  runs_scored: number;
  balls_played: number;
  fours: number;
  sixes: number;
  batting_status: string;
  is_out?: boolean;
  dismissal_type?: string;
  bowled_by_name?: string;
  caught_by_name?: string;
}

interface BowlerStats {
  player_id: string;
  player_name: string;
  runs_conceded: number;
  wickets_taken: number;
  balls_bowled: number;
  maidens: number;
  wides: number;
  no_balls: number;
}

interface FielderStats {
  player_id: string;
  player_name: string;
  catches: number;
  runouts: number;
  stumpings: number;
}

export default function MatchDetailsPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"Summary" | "Scoreboard">(
    "Summary",
  );
  const [inningsTab, setInningsTab] = useState<1 | 2>(1);

  // --- TANSTACK QUERIES ---
  const { data: matchData } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await api.get(`/matches/${matchId}`);
      return res.data.match || res.data;
    },
    refetchInterval: 5000,
  });

  const { data: liveStats } = useQuery({
    queryKey: ["liveStats", matchId],
    queryFn: async () => {
      const res = await api.get(`/scoring/live/${matchId}`);
      return res.data;
    },
    refetchInterval: 3000,
  });

  const { data: scorecardResponse } = useQuery({
    queryKey: ["scorecard", matchId],
    queryFn: async () => {
      const res = await api.get(`/scoring/scorecard/${matchId}`);
      return res.data.scorecard || [];
    },
    refetchInterval: 3000,
  });

  const scorecard = scorecardResponse || [];

  // --- TAB AUTO-SWITCH ---
  useEffect(() => {
    if (
      liveStats &&
      (liveStats.target_runs > 0 || liveStats.required_runs > 0) &&
      activeTab === "Scoreboard"
    ) {
      setInningsTab(2);
    }
  }, [liveStats, activeTab]);

  // --- PUBLIC CONFETTI EVENT LISTENER ---
  const [currentEvent, setCurrentEvent] = useState<
    "4" | "6" | "FREE_HIT" | "WICKET" | null
  >(null);
  const prevStats = useRef({ balls: 0, runs: 0, wickets: 0, innings_id: "" });

  useEffect(() => {
    if (liveStats && activeTab === "Summary") {
      const currentBalls = liveStats.legal_balls || 0;
      const currentRuns = liveStats.current_score || 0;
      const currentWickets = liveStats.wickets || 0;
      const p = prevStats.current;

      // Only pop events if the match is actively progressing in the same innings
      if (p.balls > 0 && liveStats.innings_id === p.innings_id) {
        const runDiff = currentRuns - p.runs;
        const wicketDiff = currentWickets - p.wickets;

        if (wicketDiff > 0) {
          setCurrentEvent("WICKET");
        } else if (runDiff === 4) {
          setCurrentEvent("4");
        } else if (runDiff === 6) {
          setCurrentEvent("6");
        }
      }

      prevStats.current = {
        balls: currentBalls,
        runs: currentRuns,
        wickets: currentWickets,
        innings_id: liveStats.innings_id,
      };
    }
  }, [liveStats, activeTab]);

  if (!matchData) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center animate-pulse">
        Loading match...
      </div>
    );
  }

  // --- DERIVED DATA CALCULATIONS ---
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

  const formatOvers = (totalBalls: number) => {
    return `${Math.floor((totalBalls || 0) / 6)}.${(totalBalls || 0) % 6}`;
  };

  let matchResultText = "";
  if (matchData.status === "completed") {
    if (matchData.winner_team_id) {
      matchResultText =
        matchData.winner_team_id === teamAId
          ? `${matchData.team_a_name} won the match`
          : `${matchData.team_b_name} won the match`;
    } else {
      matchResultText = "Match Tied / Drawn";
    }
  }

  // Scorecard Generation Logic
  const batters: BatterStats[] = (teamPlayers || []).map((p: any) => {
    const stats =
      scorecard.find((s: any) => String(s.player_id) === String(p.id)) || {};
    let runs = stats.runs_scored || 0;
    let playedBalls = stats.balls_played || 0;

    // Keep live ticking for the active batters
    if (String(liveStats?.striker_id) === String(p.id)) {
      runs = liveStats.striker_runs || runs;
      playedBalls = liveStats.striker_balls || playedBalls;
    } else if (String(liveStats?.non_striker_id) === String(p.id)) {
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
      // 🔥 Just read it straight from the database!
      batting_status:
        stats.batting_status ||
        (matchData?.status === "completed" ? "Did not bat" : "Yet to bat"),
    };
  });

  const bowlingTeamPlayers =
    currentBowlingTeamId === teamAId
      ? matchData?.team_a_players
      : matchData?.team_b_players;

  const bowlers: BowlerStats[] = (bowlingTeamPlayers || [])
    .map((p: any) => {
      const stats =
        scorecard.find((s: any) => String(s.player_id) === String(p.id)) || {};
      let runs = stats.runs_conceded || 0;
      let wickets = stats.wickets_taken || 0;

      if (String(liveStats?.bowler_id) === String(p.id)) {
        runs = liveStats.bowler_runs || runs;
        wickets = liveStats.bowler_wickets || wickets;
      }
      return {
        player_id: p.id,
        player_name: p.name,
        runs_conceded: runs,
        wickets_taken: wickets,
        balls_bowled: stats.balls_bowled || 0,
        maidens: stats.maidens || 0,
        wides: stats.wides || 0,
        no_balls: stats.no_balls || 0,
      };
    })
    .filter(
      (b: BowlerStats) =>
        b.balls_bowled > 0 ||
        b.runs_conceded > 0 ||
        b.wickets_taken > 0 ||
        String(liveStats?.bowler_id) === String(b.player_id),
    );

  const fielders: FielderStats[] = (bowlingTeamPlayers || [])
    .map((p: any) => {
      const stats =
        scorecard.find((s: any) => String(s.player_id) === String(p.id)) || {};
      return {
        player_id: p.id,
        player_name: p.name,
        catches: stats.catches || 0,
        runouts: stats.runouts || 0,
        stumpings: stats.stumpings || 0,
      };
    })
    .filter(
      (f: FielderStats) => f.catches > 0 || f.runouts > 0 || f.stumpings > 0,
    );

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      <FullScreenEvent
        eventType={currentEvent}
        onComplete={() => setCurrentEvent(null)}
      />

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-3 flex items-start gap-3 border-b border-border shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mt-1 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-lg font-bold text-[#F4FFFD] leading-tight truncate">
            {matchData.team_a_name} vs {matchData.team_b_name}
          </h1>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-[#9FB7B2]">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-primary/70 shrink-0">Host:</span>
              <span className="truncate text-foreground/80">
                {matchData.creator_name || "Organizer"}
              </span>
            </div>
            <span className="text-[#1B3530] shrink-0">|</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-primary/70 shrink-0">Umpire:</span>
              <span className="truncate text-foreground/80">
                {matchData.umpire_name || "Self/None"}
              </span>
            </div>
          </div>
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
          <div className="flex flex-col gap-4">
            {matchData.status === "completed" && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 shadow-sm text-center animate-fade-in">
                <div className="flex justify-center mb-2">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-black text-primary mb-4 uppercase tracking-wide">
                  {matchResultText}
                </h2>

                <div className="flex justify-center items-center gap-6 mt-4 border-t border-primary/20 pt-4">
                  <div className="text-center flex-1">
                    <div
                      className="text-sm font-bold text-[#F4FFFD] truncate max-w-[120px] mx-auto"
                      title={matchData.team_a_name}
                    >
                      {matchData.team_a_name}
                    </div>
                    <div className="text-2xl font-black text-[#0FAF9A]">
                      {matchData.team_a_score || 0}
                      <span className="text-sm font-medium text-[#9FB7B2]">
                        /{matchData.team_a_wickets || 0}
                      </span>
                    </div>
                    <div className="text-xs text-[#9FB7B2]">
                      ({formatOvers(matchData.team_a_balls)} ov)
                    </div>
                  </div>

                  <div className="text-xs font-bold text-[#9FB7B2] bg-[#1B3530] px-3 py-1 rounded-full">
                    VS
                  </div>

                  <div className="text-center flex-1">
                    <div
                      className="text-sm font-bold text-[#F4FFFD] truncate max-w-[120px] mx-auto"
                      title={matchData.team_b_name}
                    >
                      {matchData.team_b_name}
                    </div>
                    <div className="text-2xl font-black text-[#0FAF9A]">
                      {matchData.team_b_score || 0}
                      <span className="text-sm font-medium text-[#9FB7B2]">
                        /{matchData.team_b_wickets || 0}
                      </span>
                    </div>
                    <div className="text-xs text-[#9FB7B2]">
                      ({formatOvers(matchData.team_b_balls)} ov)
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#0B1F1B] border border-[#1B3530] p-5 rounded-2xl shadow-lg">
              {!liveStats?.innings_id && matchData.status !== "completed" ? (
                <div className="text-center text-[#9FB7B2] py-8">
                  Match has not started yet.
                </div>
              ) : matchData.status === "completed" && !liveStats?.innings_id ? (
                <div className="text-center text-[#9FB7B2] py-8 text-sm">
                  Detailed live summary data is not available for this finalized
                  match. Check the Scoreboard tab.
                </div>
              ) : (
                <div className="animate-fade-in text-center">
                  <div className="text-sm font-bold text-[#9FB7B2] mb-1 uppercase tracking-wider">
                    {liveStats.batting_team_id === firstInningsTeamId
                      ? firstInningsTeamId === teamAId
                        ? matchData.team_a_name
                        : matchData.team_b_name
                      : secondInningsTeamId === teamAId
                        ? matchData.team_a_name
                        : matchData.team_b_name}{" "}
                    Innings{" "}
                    {matchData.status === "completed"
                      ? "(Final Live State)"
                      : ""}
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
                      CRR:{" "}
                      <span className="text-[#0FAF9A] font-bold">{crr}</span>
                    </span>
                  </div>

                  {liveStats.target_runs > 0 && (
                    <div className="mt-5 bg-[#0D2420] border border-[#1B3530]/70 rounded-xl p-4 shadow-sm text-left">
                      <div className="flex justify-between items-center mb-2.5 text-sm">
                        <span className="text-[#9FB7B2] font-medium">
                          Target: {liveStats.target_runs}
                        </span>
                        <span className="text-[#0FAF9A] font-bold">
                          Need{" "}
                          {Math.max(
                            0,
                            liveStats.target_runs - liveStats.current_score,
                          )}{" "}
                          runs
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-[#1B3530] rounded-full overflow-hidden mb-2.5">
                        <div
                          className="h-full bg-[#0FAF9A] transition-all duration-500 ease-in-out rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                (liveStats.current_score /
                                  liveStats.target_runs) *
                                  100,
                              ),
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#9FB7B2] font-medium">
                        <span>
                          RRR:{" "}
                          {matchData.overs_limit * 6 - liveStats.legal_balls > 0
                            ? (
                                (Math.max(
                                  0,
                                  liveStats.target_runs -
                                    liveStats.current_score,
                                ) /
                                  (matchData.overs_limit * 6 -
                                    liveStats.legal_balls)) *
                                6
                              ).toFixed(2)
                            : "0.00"}
                        </span>
                        <span>
                          {Math.max(
                            0,
                            matchData.overs_limit * 6 - liveStats.legal_balls,
                          )}{" "}
                          balls left
                        </span>
                      </div>
                    </div>
                  )}

                  {matchData.status !== "completed" && (
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
                  )}
                </div>
              )}
            </div>
            {/* 🔥 SQAURE-STYLE RECENT BALLS TIMELINE (SPECTATOR SCREEN) */}
            {matchData.status !== "completed" && (
              <OverTimeline recentBalls={liveStats?.recent_balls || []} />
            )}
          </div>
        )}

        {/* ----------------- SCOREBOARD TAB ----------------- */}
        {activeTab === "Scoreboard" && (
          <div className="animate-fade-in space-y-6">
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

            <h3 className="text-[#F4FFFD] font-bold text-sm px-1">
              {battingTeamName} Batting
            </h3>

            {/* BATTING SCORECARD */}
            <div className="overflow-x-auto no-scrollbar">
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
                    let statusClass = "text-[#9FB7B2]"; // Default grey for Yet to bat / Did not bat

                    if (
                      batter.batting_status === "Batting" ||
                      batter.batting_status === "Not out"
                    ) {
                      statusClass = "text-[#0FAF9A] font-bold text-[10px]";
                    } else if (batter.batting_status === "Out") {
                      statusClass = "text-destructive font-bold text-[10px]";
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
                        <div className="w-1/3 min-w-[130px] font-bold text-[#F4FFFD] flex flex-col justify-center items-start">
                          <span>{batter.player_name}</span>
                          <span
                            className={`mt-0.5 leading-tight inline-block ${statusClass}`}
                          >
                            {/* 🔥 Render the exact string the backend calculated */}
                            {batter.batting_status}
                          </span>
                        </div>
                        <div className="flex-1 text-center font-bold text-[#F4FFFD]">
                          {batter.runs_scored}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.balls_played}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.fours}
                        </div>
                        <div className="flex-1 text-center text-[#9FB7B2]">
                          {batter.sixes}
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

            {/* BOWLING SCORECARD */}
            {bowlers.length > 0 && (
              <>
                <h3 className="text-[#F4FFFD] font-bold text-sm px-1 mt-6">
                  Bowling
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="bg-[#0B1F1B] rounded-xl border border-[#1B3530] overflow-hidden shadow-md min-w-[600px]">
                    <div className="bg-[#1B3530]/50 p-2.5 flex items-center text-[11px] text-[#9FB7B2] font-bold uppercase tracking-wider">
                      <div className="w-1/4 min-w-[120px]">Bowler</div>
                      <div className="flex-1 text-center">O</div>
                      <div className="flex-1 text-center">M</div>
                      <div className="flex-1 text-center">R</div>
                      <div className="flex-1 text-center">W</div>
                      <div className="flex-1 text-center">NB</div>
                      <div className="flex-1 text-center">WD</div>
                      <div className="flex-1 text-right pr-2">ECO</div>
                    </div>

                    <div className="divide-y divide-[#1B3530]/50">
                      {bowlers.map((bowler: BowlerStats) => {
                        const bOvers = Math.floor(bowler.balls_bowled / 6);
                        const bBalls = bowler.balls_bowled % 6;
                        const displayOvers = `${bOvers}.${bBalls}`;
                        const ecoCalc =
                          bowler.balls_bowled > 0
                            ? (
                                (bowler.runs_conceded / bowler.balls_bowled) *
                                6
                              ).toFixed(1)
                            : "0.0";

                        return (
                          <div
                            key={bowler.player_id}
                            className="p-2.5 flex items-center text-sm"
                          >
                            <div className="w-1/4 min-w-[120px] font-bold text-[#F4FFFD]">
                              {bowler.player_name}
                            </div>
                            <div className="flex-1 text-center text-[#9FB7B2]">
                              {displayOvers}
                            </div>
                            <div className="flex-1 text-center text-[#9FB7B2]">
                              {bowler.maidens}
                            </div>
                            <div className="flex-1 text-center font-bold text-destructive">
                              {bowler.runs_conceded}
                            </div>
                            <div className="flex-1 text-center font-bold text-[#F4FFFD]">
                              {bowler.wickets_taken}
                            </div>
                            <div className="flex-1 text-center text-[#9FB7B2]">
                              {bowler.no_balls}
                            </div>
                            <div className="flex-1 text-center text-[#9FB7B2]">
                              {bowler.wides}
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
              </>
            )}

            {/* FIELDING SCORECARD */}
            {fielders.length > 0 && (
              <>
                <h3 className="text-[#F4FFFD] font-bold text-sm px-1 mt-6">
                  Fielding
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="bg-[#0B1F1B] rounded-xl border border-[#1B3530] overflow-hidden shadow-md min-w-[400px]">
                    <div className="bg-[#1B3530]/50 p-2.5 flex items-center text-[11px] text-[#9FB7B2] font-bold uppercase tracking-wider">
                      <div className="w-1/2 min-w-[130px]">Fielder</div>
                      <div className="flex-1 text-center">Catches</div>
                      <div className="flex-1 text-center">Run Outs</div>
                      <div className="flex-1 text-right pr-2">Stumpings</div>
                    </div>

                    <div className="divide-y divide-[#1B3530]/50">
                      {fielders.map((fielder: FielderStats) => (
                        <div
                          key={fielder.player_id}
                          className="p-2.5 flex items-center text-sm"
                        >
                          <div className="w-1/2 min-w-[130px] font-bold text-[#F4FFFD]">
                            {fielder.player_name}
                          </div>
                          <div className="flex-1 text-center text-[#0FAF9A] font-bold">
                            {fielder.catches}
                          </div>
                          <div className="flex-1 text-center text-destructive font-bold">
                            {fielder.runouts}
                          </div>
                          <div className="flex-1 text-right pr-2 text-warning font-bold">
                            {fielder.stumpings}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
