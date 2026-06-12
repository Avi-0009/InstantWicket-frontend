import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, Share2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../Api/Auth";
import { FullScreenEvent } from "../components/scoring/FullScreenEvent";
import OverTimeline from "../components/scoring/OverTimeline";
import MatchAnalytics from "../components/scoring/MatchAnalytics";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";

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

  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const matchUrl = window.location.href;

    const shareTitle = `Live Cricket: ${matchData.team_a_name} vs ${matchData.team_b_name}`;
    const shareText = `🏆 LIVE CRICKET ACTION! 🏆\n🏏 ${matchData.team_a_name} vs ${matchData.team_b_name}\n\nCatch the live score here 👇`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: matchUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.log(
          "Native share not supported or failed, falling back to clipboard.",
        );
      }
    }

    const fullTextToCopy = `${shareText}\n${matchUrl}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullTextToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullTextToCopy;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();

        const successful = document.execCommand("copy");
        textArea.remove();

        if (!successful) throw new Error("Fallback copy failed");
      }

      setIsCopied(true);
      toast.success("Epic match link copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      toast.error("Failed to copy link");
    }
  };

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

  useEffect(() => {
    if (
      liveStats &&
      (liveStats.target_runs > 0 || liveStats.required_runs > 0) &&
      activeTab === "Scoreboard"
    ) {
      setInningsTab(2);
    }
  }, [liveStats, activeTab]);

  const [eventQueue, setEventQueue] = useState<
    ("4" | "6" | "FREE_HIT" | "WICKET")[]
  >([]);
  const currentEvent = eventQueue[0] || null;

  const prevStats = useRef({ balls: 0, runs: 0, wickets: 0, innings_id: "" });

  useEffect(() => {
    if (liveStats && activeTab === "Summary") {
      const currentBalls = liveStats.legal_balls || 0;
      const currentRuns = liveStats.current_score || 0;
      const currentWickets = liveStats.wickets || 0;
      const p = prevStats.current;

      if (p.balls > 0 && liveStats.innings_id === p.innings_id) {
        const runDiff = currentRuns - p.runs;
        const wicketDiff = currentWickets - p.wickets;
        const lastBall =
          liveStats.recent_balls?.[liveStats.recent_balls.length - 1] || "";

        const lowerLastBall = lastBall.toLowerCase();

        const newEvents: ("4" | "6" | "FREE_HIT" | "WICKET")[] = [];

        if (wicketDiff > 0) {
          newEvents.push("WICKET");
        } else if (lowerLastBall) {
          if (lowerLastBall.includes("nb")) {
            newEvents.push("FREE_HIT");
          }

          if (
            runDiff === 4 ||
            (lowerLastBall.includes("nb") && runDiff === 5)
          ) {
            newEvents.push("4");
          }
          if (
            runDiff === 6 ||
            (lowerLastBall.includes("nb") && runDiff === 7)
          ) {
            newEvents.push("6");
          }
        }

        if (newEvents.length > 0) {
          setEventQueue((prev) => [...prev, ...newEvents]);
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

  const overs = liveStats ? Math.floor((liveStats.legal_balls || 0) / 6) : 0;
  const balls = liveStats ? (liveStats.legal_balls || 0) % 6 : 0;

  const totalTeamRuns = liveStats?.current_score || 0;
  const totalTeamBalls = liveStats?.legal_balls || 0;

  const crr =
    totalTeamBalls > 0
      ? ((6 * totalTeamRuns) / totalTeamBalls).toFixed(2)
      : "0.00";

  const targetRuns = liveStats?.target_runs || 0;
  const runsNeeded = Math.max(0, targetRuns - totalTeamRuns);
  const ballsLeft = matchData
    ? Math.max(0, matchData.overs_limit * 6 - totalTeamBalls)
    : 0;

  const rrr =
    ballsLeft > 0 ? ((6 * runsNeeded) / ballsLeft).toFixed(2) : "0.00";

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

  // 🔥 FORMATTER: Subtracts the 1 penalty run mathematically so it shows purely what the user ran
  const formatTimelineBall = (ball: string) => {
    if (!ball) return "";
    let formatted = ball.toLowerCase();

    // Looks for a number followed by wd or nb (e.g. "1wd", "2nb w", "3wd")
    formatted = formatted.replace(/(\d+)(wd|nb)/g, (match, num, type) => {
      const runs = parseInt(num, 10) - 1; // Subtract the 1 penalty run
      return runs > 0 ? `${runs}${type}` : type; // If 0, just show 'wd' or 'nb'
    });

    // Strip the '1' from byes and leg byes if you also just want 'B' instead of '1B'
    formatted = formatted.replace(/^1(b|lb)/, "$1");

    return formatted.toUpperCase(); // Capitalize everything for a clean look
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

  const batters: BatterStats[] = (teamPlayers || []).map((p: any) => {
    const stats =
      scorecard.find((s: any) => String(s.player_id) === String(p.id)) || {};
    let runs = stats.runs_scored || 0;
    let playedBalls = stats.balls_played || 0;

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

  const activeBowlerScorecard = scorecard.find(
    (s: any) => String(s.player_id) === String(liveStats?.bowler_id),
  );
  const activeBowlerBalls = activeBowlerScorecard?.balls_bowled || 0;
  const activeBowlerRuns =
    activeBowlerScorecard?.runs_conceded || liveStats?.bowler_runs || 0;
  const activeBowlerWickets =
    activeBowlerScorecard?.wickets_taken || liveStats?.bowler_wickets || 0;

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      <FullScreenEvent
        eventType={currentEvent}
        onComplete={() => setEventQueue((prev) => prev.slice(1))}
      />

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-3 flex items-start gap-3 border-b border-border shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 mt-1 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-lg font-bold text-primary leading-tight truncate">
            {(matchData.team_a_name || "")
              .split(" ")
              .map((word: string, i: string) => (
                <span key={`team-a-${i}`}>
                  <span className="uppercase">{word.charAt(0)}</span>
                  {word.slice(1).toLowerCase()}{" "}
                </span>
              ))}
            <span className="mx-1 text-foreground">vs</span>{" "}
            {(matchData.team_b_name || "")
              .split(" ")
              .map((word: string, i: string) => (
                <span key={`team-b-${i}`}>
                  <span className="text-primary uppercase">
                    {word.charAt(0)}
                  </span>
                  {word.slice(1).toLowerCase()}{" "}
                </span>
              ))}
          </h1>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-primary/70 shrink-0">Host:</span>
              <span className="truncate text-foreground/80">
                {matchData.creator_name || "Organizer"}
              </span>
            </div>
            <span className="text-border shrink-0">|</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-primary/70 shrink-0">Umpire:</span>
              <span className="truncate text-foreground/80">
                {matchData.umpire_name || "Self/None"}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="mt-0.5 shrink-0 rounded-full w-9 h-9 border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Share2 className="w-4 h-4 text-foreground" />
          )}
        </Button>
      </div>

      <div className="p-4">
        <div className="flex bg-card p-1 rounded-xl border border-border mb-6">
          <button
            onClick={() => setActiveTab("Summary")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "Summary"
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("Scoreboard")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "Scoreboard"
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Scoreboard
          </button>
        </div>

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
                      className="text-sm font-bold text-foreground truncate max-w-30 mx-auto"
                      title={matchData.team_a_name}
                    >
                      {matchData.team_a_name}
                    </div>
                    <div className="text-2xl font-black text-primary">
                      {matchData.team_a_score || 0}
                      <span className="text-sm font-medium text-muted-foreground">
                        /{matchData.team_a_wickets || 0}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({formatOvers(matchData.team_a_balls)} ov)
                    </div>
                  </div>

                  <div className="text-xs font-bold text-muted-foreground bg-border px-3 py-1 rounded-full">
                    VS
                  </div>

                  <div className="text-center flex-1">
                    <div
                      className="text-sm font-bold text-foreground truncate max-w-30 mx-auto"
                      title={matchData.team_b_name}
                    >
                      {matchData.team_b_name}
                    </div>
                    <div className="text-2xl font-black text-primary">
                      {matchData.team_b_score || 0}
                      <span className="text-sm font-medium text-muted-foreground">
                        /{matchData.team_b_wickets || 0}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({formatOvers(matchData.team_b_balls)} ov)
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border border-border p-5 rounded-2xl shadow-lg">
              {!liveStats?.innings_id && matchData.status !== "completed" ? (
                <div className="text-center text-muted-foreground py-8">
                  Match has not started yet.
                </div>
              ) : matchData.status === "completed" && !liveStats?.innings_id ? (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Detailed live summary data is not available for this finalized
                  match. Check the Scoreboard tab.
                </div>
              ) : (
                <div className="animate-fade-in text-center">
                  <div className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider">
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
                  <div className="text-5xl font-black text-foreground tracking-tight drop-shadow-md">
                    {liveStats.current_score}{" "}
                    <span className="text-2xl text-muted-foreground font-semibold">
                      / {liveStats.wickets}
                    </span>
                  </div>
                  <div className="flex justify-center items-center gap-4 mt-2 text-sm font-medium">
                    <span className="text-muted-foreground">
                      Overs:{" "}
                      <span className="text-primary font-bold">
                        {overs}.{balls}
                      </span>
                    </span>
                    <span className="text-border">|</span>
                    <span className="text-muted-foreground">
                      CRR: <span className="text-primary font-bold">{crr}</span>
                    </span>
                  </div>

                  {liveStats.target_runs > 0 && (
                    <div className="mt-5 bg-muted/50 border border-border/70 rounded-xl p-4 shadow-sm text-left">
                      <div className="flex justify-between items-center mb-2.5 text-sm">
                        <span className="text-muted-foreground font-medium">
                          Target: {liveStats.target_runs}
                        </span>
                        <span className="text-primary font-bold">
                          Need{" "}
                          {Math.max(
                            0,
                            liveStats.target_runs - liveStats.current_score,
                          )}{" "}
                          runs
                        </span>
                      </div>

                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-2.5">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
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

                      <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                        <span>RRR: {rrr}</span>
                        <span>{ballsLeft} balls left</span>
                      </div>
                    </div>
                  )}

                  {matchData.status !== "completed" && (
                    <div className="flex flex-col gap-3 mt-6 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 p-3.5 rounded-xl border border-border/50 shadow-sm">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                            Striker
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="font-bold text-foreground text-sm truncate flex items-center gap-1">
                              {liveStats.striker_name || "Waiting..."}{" "}
                              <span className="text-primary text-lg leading-none">
                                *
                              </span>
                            </div>
                            <div className="text-primary text-sm font-bold shrink-0 ml-2">
                              {liveStats.striker_runs || 0}{" "}
                              <span className="text-muted-foreground text-xs font-medium">
                                ({liveStats.striker_balls || 0})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/50 p-3.5 rounded-xl border border-border/50 shadow-sm">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                            Non-Striker
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-muted-foreground text-sm truncate">
                              {liveStats.non_striker_name || "Waiting..."}
                            </div>
                            <div className="text-muted-foreground text-sm font-medium shrink-0 ml-2">
                              {liveStats.non_striker_runs || 0}{" "}
                              <span className="text-xs">
                                ({liveStats.non_striker_balls || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-destructive/10 p-3.5 rounded-xl border border-destructive/20 shadow-sm">
                        <div className="text-[10px] text-destructive/80 font-bold uppercase tracking-wider mb-2">
                          Bowler
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-destructive text-sm truncate">
                            {liveStats.bowler_name || "Waiting..."}
                          </div>
                          <div className="text-right">
                            <div className="text-destructive text-sm font-black shrink-0 ml-2">
                              {activeBowlerWickets}
                              <span className="text-destructive/70 font-medium mx-0.5">
                                -
                              </span>
                              {activeBowlerRuns}
                            </div>
                            <div className="text-[10px] text-destructive/70 font-bold mt-0.5">
                              ({Math.floor(activeBowlerBalls / 6)}.
                              {activeBowlerBalls % 6} ov)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🔥 Applies frontend formatting to clean up the backend timeline strings! */}
            {matchData.status !== "completed" && (
              <OverTimeline
                recentBalls={(liveStats?.recent_balls || []).map(
                  formatTimelineBall,
                )}
              />
            )}

            {matchData.status !== "completed" &&
              liveStats &&
              liveStats.non_striker_name && (
                <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex justify-between items-center animate-fade-in mt-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
                      Current Partnership
                    </div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span className="truncate max-w-25 sm:max-w-35">
                        {liveStats.striker_name || "Batsman 1"}
                      </span>
                      <span className="text-muted-foreground font-medium text-xs">
                        &
                      </span>
                      <span className="truncate max-w-25 sm:max-w-35">
                        {liveStats.non_striker_name || "Batsman 2"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xl font-black text-primary leading-none">
                      {liveStats.partnership_runs || 0}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">
                      ({liveStats.partnership_balls || 0} balls)
                    </div>
                  </div>
                </div>
              )}

            {matchData.status === "completed" && (
              <MatchAnalytics matchData={matchData} scorecard={scorecard} />
            )}
          </div>
        )}

        {activeTab === "Scoreboard" && (
          <div className="animate-fade-in space-y-6">
            <div className="flex gap-6 border-b border-border mb-4 px-2">
              <button
                onClick={() => setInningsTab(1)}
                className={`pb-3 text-sm font-bold transition-colors relative ${inningsTab === 1 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                1st Innings
                {inningsTab === 1 && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                )}
              </button>
              <button
                onClick={() => setInningsTab(2)}
                className={`pb-3 text-sm font-bold transition-colors relative ${inningsTab === 2 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                2nd Innings
                {inningsTab === 2 && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                )}
              </button>
            </div>

            <h3 className="text-foreground font-bold text-sm px-1">
              {battingTeamName} Batting
            </h3>

            <div className="overflow-x-auto no-scrollbar">
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md min-w-125">
                <div className="bg-border/50 p-2.5 flex items-center text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                  <div className="w-1/3 min-w-32.5">Batsman</div>
                  <div className="flex-1 text-center">R</div>
                  <div className="flex-1 text-center">B</div>
                  <div className="flex-1 text-center">4s</div>
                  <div className="flex-1 text-center">6s</div>
                  <div className="flex-1 text-right pr-2">SR</div>
                </div>

                <div className="divide-y divide-border/50">
                  {batters.map((batter: BatterStats) => {
                    let statusClass = "text-muted-foreground";

                    if (
                      batter.batting_status === "Batting" ||
                      batter.batting_status === "Not out"
                    ) {
                      statusClass = "text-primary font-bold text-[10px]";
                    } else if (batter.batting_status === "Out") {
                      statusClass = "text-destructive font-bold text-[10px]";
                    }

                    const batterRuns = batter.runs_scored || 0;
                    const batterBalls = batter.balls_played || 0;

                    const sr =
                      batterBalls > 0
                        ? ((batterRuns / batterBalls) * 100).toFixed(2)
                        : "0.00";

                    return (
                      <div
                        key={batter.player_id}
                        className="p-2.5 flex items-center text-sm"
                      >
                        <div className="w-1/3 min-w-32.5 font-bold text-foreground flex flex-col justify-center items-start">
                          <span>{batter.player_name}</span>
                          <span
                            className={`mt-0.5 leading-tight inline-block ${statusClass}`}
                          >
                            {batter.batting_status}
                          </span>
                        </div>
                        <div className="flex-1 text-center font-bold text-foreground">
                          {batter.runs_scored}
                        </div>
                        <div className="flex-1 text-center text-muted-foreground">
                          {batter.balls_played}
                        </div>
                        <div className="flex-1 text-center text-muted-foreground">
                          {batter.fours}
                        </div>
                        <div className="flex-1 text-center text-muted-foreground">
                          {batter.sixes}
                        </div>
                        <div className="flex-1 text-right pr-2 text-muted-foreground">
                          {sr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {bowlers.length > 0 && (
              <>
                <h3 className="text-foreground font-bold text-sm px-1 mt-6">
                  Bowling
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md min-w-150">
                    <div className="bg-border/50 p-2.5 flex items-center text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                      <div className="w-1/4 min-w-30">Bowler</div>
                      <div className="flex-1 text-center">O</div>
                      <div className="flex-1 text-center">M</div>
                      <div className="flex-1 text-center">R</div>
                      <div className="flex-1 text-center">W</div>
                      <div className="flex-1 text-center">NB</div>
                      <div className="flex-1 text-center">WD</div>
                      <div className="flex-1 text-right pr-2">ECO</div>
                    </div>

                    <div className="divide-y divide-border/50">
                      {bowlers.map((bowler: BowlerStats) => {
                        const bOvers = Math.floor(bowler.balls_bowled / 6);
                        const bBalls = bowler.balls_bowled % 6;
                        const displayOvers = `${bOvers}.${bBalls}`;
                        const bowlerRuns = bowler.runs_conceded || 0;
                        const bowlerBalls = bowler.balls_bowled || 0;

                        const ecoCalc =
                          bowlerBalls > 0
                            ? ((6 * bowlerRuns) / bowlerBalls).toFixed(2)
                            : "0.00";

                        return (
                          <div
                            key={bowler.player_id}
                            className="p-2.5 flex items-center text-sm"
                          >
                            <div className="w-1/4 min-w-30 font-bold text-foreground">
                              {bowler.player_name}
                            </div>
                            <div className="flex-1 text-center text-muted-foreground">
                              {displayOvers}
                            </div>
                            <div className="flex-1 text-center text-muted-foreground">
                              {bowler.maidens}
                            </div>
                            <div className="flex-1 text-center font-bold text-destructive">
                              {bowler.runs_conceded}
                            </div>
                            <div className="flex-1 text-center font-bold text-foreground">
                              {bowler.wickets_taken}
                            </div>
                            <div className="flex-1 text-center text-muted-foreground">
                              {bowler.no_balls}
                            </div>
                            <div className="flex-1 text-center text-muted-foreground">
                              {bowler.wides}
                            </div>
                            <div className="flex-1 text-right pr-2 text-muted-foreground">
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

            {fielders.length > 0 && (
              <>
                <h3 className="text-foreground font-bold text-sm px-1 mt-6">
                  Fielding
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="bg-card rounded-xl border border-border overflow-hidden shadow-md min-w-100">
                    <div className="bg-border/50 p-2.5 flex items-center text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                      <div className="w-1/2 min-w-32.5">Fielder</div>
                      <div className="flex-1 text-center">Catches</div>
                      <div className="flex-1 text-center">Run Outs</div>
                      <div className="flex-1 text-right pr-2">Stumpings</div>
                    </div>

                    <div className="divide-y divide-border/50">
                      {fielders.map((fielder: FielderStats) => (
                        <div
                          key={fielder.player_id}
                          className="p-2.5 flex items-center text-sm"
                        >
                          <div className="w-1/2 min-w-32.5 font-bold text-foreground">
                            {fielder.player_name}
                          </div>
                          <div className="flex-1 text-center text-primary font-bold">
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
