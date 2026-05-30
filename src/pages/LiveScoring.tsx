import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, AlertOctagon, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../Api/Auth";
import toast from "react-hot-toast";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import ScoringPad from "../components/scoring/ScoringPad";
import {
  PlayerSelectModal,
  type Player,
} from "../components/scoring/PlayerSelectModal";
import { FullScreenEvent } from "../components/scoring/FullScreenEvent";
import { WicketForm } from "../components/scoring/WicketForm";
import { DeclareModal } from "../components/scoring/DeclareModal";

const LiveScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [matchData, setMatchData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [hasSynced, setHasSynced] = useState(false);

  const [modifier, setModifier] = useState<"WD" | "NB" | null>(null);
  const [isFreeHit, setIsFreeHit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<
    "4" | "6" | "FREE_HIT" | "WICKET" | null
  >(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    role: "Striker" | "Non-Striker" | "Bowler" | null;
  }>({ isOpen: false, role: null });

  const [activeStriker, setActiveStriker] = useState<Player | null>(null);
  const [activeNonStriker, setActiveNonStriker] = useState<Player | null>(null);
  const [activeBowler, setActiveBowler] = useState<Player | null>(null);
  const [previousBowlerId, setPreviousBowlerId] = useState<string | null>(null);

  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isInningsDeclared, setIsInningsDeclared] = useState(false);
  const [thisOverTimeline, setThisOverTimeline] = useState<string[]>([]);
  const [showWicketForm, setShowWicketForm] = useState(false);
  const [pendingRuns, setPendingRuns] = useState(0);

  const milestones = useRef<
    Record<string, { thirty: boolean; fifty: boolean; hundred: boolean }>
  >({});

  const getBatterStats = (playerId?: string) => {
    if (!playerId || !liveStats) return { runs: 0, balls: 0 };
    if (playerId === liveStats.striker_id)
      return {
        runs: liveStats.striker_runs || 0,
        balls: liveStats.striker_balls || 0,
      };
    if (playerId === liveStats.non_striker_id)
      return {
        runs: liveStats.non_striker_runs || 0,
        balls: liveStats.non_striker_balls || 0,
      };
    return { runs: 0, balls: 0 };
  };

  const fetchLiveScoreboard = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await api.get(`/scoring/live/${matchId}`);
      if (res.data && Object.keys(res.data).length > 0) {
        setLiveStats(res.data);

        const strikerId = res.data.striker_id;
        const strikerRuns = res.data.striker_runs || 0;
        const strikerName = res.data.striker_name;

        if (strikerId) {
          if (!milestones.current[strikerId]) {
            milestones.current[strikerId] = {
              thirty: false,
              fifty: false,
              hundred: false,
            };
          }

          if (strikerRuns >= 100 && !milestones.current[strikerId].hundred) {
            toast.success(`💯 CENTURY! Brilliant 100 by ${strikerName}!`, {
              duration: 6000,
              icon: "🔥",
            });
            milestones.current[strikerId].hundred = true;
          } else if (
            strikerRuns >= 50 &&
            strikerRuns < 100 &&
            !milestones.current[strikerId].fifty
          ) {
            toast.success(`🏏 HALF-CENTURY for ${strikerName}!`, {
              duration: 5000,
              icon: "👏",
            });
            milestones.current[strikerId].fifty = true;
          } else if (
            strikerRuns >= 30 &&
            strikerRuns < 50 &&
            !milestones.current[strikerId].thirty
          ) {
            toast.success(`Solid 30 by ${strikerName}! Keep going!`, {
              duration: 4000,
              icon: "💪",
            });
            milestones.current[strikerId].thirty = true;
          }
        }
      }
    } catch (error: any) {}
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(fetchLiveScoreboard, 3000);
    return () => clearInterval(interval);
  }, [matchId, fetchLiveScoreboard]);

  useEffect(() => {
    const fetchMatchInfo = async () => {
      try {
        const matchRes = await api.get(`/matches/${matchId}`);
        const match = matchRes.data.match || matchRes.data;
        setMatchData(match);
      } catch (error) {
        console.error("Match Info Error:", error);
      }
    };
    if (matchId) {
      fetchMatchInfo();
      fetchLiveScoreboard();
    }
  }, [matchId, fetchLiveScoreboard]);

  const teamAPlayers: Player[] = matchData?.team_a_players || [];
  const teamBPlayers: Player[] = matchData?.team_b_players || [];
  const tossWinnerBatting =
    matchData?.toss_decision === "bat"
      ? matchData?.toss_winner_team_id === matchData?.team_a_id
      : matchData?.toss_winner_team_id === matchData?.team_b_id;

  const teamAId = matchData?.team_a_id;
  const teamBId = matchData?.team_b_id;
  const expectedFirstInningsTeamId =
    matchData?.toss_decision === "bat"
      ? matchData?.toss_winner_team_id
      : matchData?.toss_winner_team_id === teamAId
        ? teamBId
        : teamAId;

  const targetRuns = liveStats?.target_runs || liveStats?.required_runs || 0;
  const isSecondInnings =
    targetRuns > 0 ||
    (liveStats?.batting_team_id &&
      expectedFirstInningsTeamId &&
      liveStats.batting_team_id !== expectedFirstInningsTeamId);

  const activeBattersCount = isSecondInnings
    ? tossWinnerBatting
      ? teamBPlayers.length
      : teamAPlayers.length
    : tossWinnerBatting
      ? teamAPlayers.length
      : teamBPlayers.length;
  const maxWickets = matchData?.allow_solo_batting
    ? activeBattersCount
    : Math.max(1, activeBattersCount - 1);
  const maxBalls = (matchData?.overs_limit || 0) * 6;

  const currentWickets = liveStats?.wickets || 0;
  const currentLegalBalls = liveStats?.legal_balls || 0;
  const currentTotalScore = liveStats?.current_score || 0;

  const isAllOut = currentWickets >= maxWickets && maxWickets > 0;
  const isOversDone = maxBalls > 0 && currentLegalBalls >= maxBalls;
  const isTargetReached =
    isSecondInnings && currentTotalScore >= targetRuns && targetRuns > 0;

  const hasInningsStarted = !!liveStats?.innings_id;
  const isCurrentInningsOver =
    hasInningsStarted &&
    (isAllOut || isOversDone || isTargetReached || isInningsDeclared);
  const isPreparingSecondInnings =
    hasInningsStarted && isCurrentInningsOver && !isSecondInnings;

  const shouldFlipTeams = isSecondInnings || isPreparingSecondInnings;
  const isTeamABatting = shouldFlipTeams
    ? !tossWinnerBatting
    : tossWinnerBatting;

  const battingSquad: Player[] = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingSquad: Player[] = isTeamABatting ? teamBPlayers : teamAPlayers;

  useEffect(() => {
    if (liveStats && matchData && !isPreparingSecondInnings && !hasSynced) {
      if (liveStats.striker_id)
        setActiveStriker(
          battingSquad.find((p) => p.id === liveStats.striker_id) || null,
        );
      if (liveStats.non_striker_id)
        setActiveNonStriker(
          battingSquad.find((p) => p.id === liveStats.non_striker_id) || null,
        );
      if (liveStats.bowler_id)
        setActiveBowler(
          bowlingSquad.find((p) => p.id === liveStats.bowler_id) || null,
        );
      setHasSynced(true);
    }
  }, [
    liveStats,
    matchData,
    isPreparingSecondInnings,
    hasSynced,
    battingSquad,
    bowlingSquad,
  ]);

  useEffect(() => {
    if (isPreparingSecondInnings) {
      setActiveStriker(null);
      setActiveNonStriker(null);
      setActiveBowler(null);
      setPreviousBowlerId(null);
      setHasSynced(false);
    }
  }, [isPreparingSecondInnings]);

  const overs = Math.floor(currentLegalBalls / 6);
  const ballsInOver = currentLegalBalls % 6;
  const oversDisplay = Number(`${overs}.${ballsInOver}`);

  const handleStartInnings = async () => {
    // We let the API start the innings directly. UI will ask for players afterward!
    const currentInningsNo = isPreparingSecondInnings ? 2 : 1;
    const targetToSet = isPreparingSecondInnings ? currentTotalScore + 1 : null;

    const payload = {
      match_id: matchId,
      batting_team_id: isTeamABatting
        ? matchData.team_a_id
        : matchData.team_b_id,
      bowling_team_id: isTeamABatting
        ? matchData.team_b_id
        : matchData.team_a_id,
      striker_id: activeStriker?.id || null,
      non_striker_id: activeNonStriker?.id || null,
      bowler_id: activeBowler?.id || null,
      innings_no: currentInningsNo,
      target_runs: targetToSet,
    };

    try {
      const res = await api.post("/scoring/start", payload);
      setIsInningsDeclared(false);
      const newInningsId =
        res.data?.inningID ||
        res.data?.data ||
        res.data?.innings_id ||
        res.data?.id ||
        "active-innings";
      setLiveStats((prev: any) => ({
        ...prev,
        innings_id: newInningsId,
        innings_no: currentInningsNo,
        batting_team_id: payload.batting_team_id,
        bowling_team_id: payload.bowling_team_id,
        legal_balls: 0,
        current_score: 0,
        wickets: 0,
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start innings");
    }
  };

  const handleBall = (runs: number, isWicket: boolean = false) => {
    if (!hasInningsStarted) return toast.error("Innings has not started yet!");
    // Logic enforced here: Cannot feed balls without players assigned!
    if (!activeStriker || !activeNonStriker || !activeBowler) {
      return toast.error(
        "Please assign a Striker, Non-Striker, and Bowler first!",
        { duration: 2000 },
      );
    }

    if (isWicket) {
      setPendingRuns(runs);
      setShowWicketForm(true);
      return;
    }
    executeBallApi(runs, false, null, null, null);
  };

  const handleWicketSubmit = (
    wicketType: string,
    outBatterRole: "striker" | "non_striker",
    fielderId: string | null,
  ) => {
    const exactOutPlayerId =
      outBatterRole === "striker" ? activeStriker?.id : activeNonStriker?.id;
    executeBallApi(
      pendingRuns,
      true,
      wicketType,
      exactOutPlayerId || null,
      fielderId,
    );
    setShowWicketForm(false);
  };

  const executeBallApi = async (
    runs: number,
    isWicket: boolean,
    wicketType: string | null,
    outPlayerId: string | null,
    fielderId: string | null,
  ) => {
    let isLegal = true,
      runsFromBat = runs,
      extras = 0,
      extraType: string | null = null;

    if (modifier === "WD") {
      isLegal = false;
      runsFromBat = 0;
      extras = runs + 1;
      extraType = "wide";
    } else if (modifier === "NB") {
      isLegal = false;
      runsFromBat = runs;
      extras = 1;
      extraType = "no_ball";
      setCurrentEvent("FREE_HIT");
      setIsFreeHit(true);
    } else {
      if (isFreeHit) setIsFreeHit(false);
    }

    if (!modifier && runsFromBat === 4) setCurrentEvent("4");
    if (!modifier && runsFromBat === 6) setCurrentEvent("6");
    if (isWicket) setCurrentEvent("WICKET");

    const payload: any = {
      match_id: matchId,
      innings_id: liveStats.innings_id,
      over_number: overs,
      ball_number: ballsInOver + 1,
      striker_id: activeStriker?.id,
      non_striker_id: activeNonStriker?.id,
      bowler_id: activeBowler?.id,
      is_legal_ball: isLegal,
      runs_from_bat: runsFromBat,
      extras: extras,
      is_wicket: isWicket,
    };

    if (extraType) payload.extra_type = extraType;
    if (wicketType) payload.wicket_type = wicketType;
    if (isWicket && outPlayerId) payload.out_player_id = outPlayerId;
    if (fielderId) payload.fielder_id = fielderId;

    try {
      await api.post("/scoring/ball", payload);

      let ballOutcome = "";
      if (isWicket) ballOutcome = "W";
      else if (extraType === "wide") ballOutcome = `${extras}wd`;
      else if (extraType === "no_ball")
        ballOutcome = `${runsFromBat + extras}nb`;
      else ballOutcome = `${runsFromBat}`;

      setThisOverTimeline((prev) => [...prev, ballOutcome]);
      setModifier(null);
      await fetchLiveScoreboard();

      let shouldSwapStrikers = runsFromBat % 2 !== 0;
      if (isLegal && ballsInOver === 5)
        shouldSwapStrikers = !shouldSwapStrikers;

      let finalStrikerId = activeStriker?.id;
      let finalNonStrikerId = activeNonStriker?.id;

      if (shouldSwapStrikers) {
        finalStrikerId = activeNonStriker?.id;
        finalNonStrikerId = activeStriker?.id;
      }

      if (isWicket && outPlayerId) {
        if (finalStrikerId === outPlayerId) finalStrikerId = undefined;
        if (finalNonStrikerId === outPlayerId) finalNonStrikerId = undefined;
      }

      setActiveStriker(
        battingSquad.find((p) => p.id === finalStrikerId) || null,
      );
      setActiveNonStriker(
        battingSquad.find((p) => p.id === finalNonStrikerId) || null,
      );

      if (isWicket && outPlayerId) {
        setTimeout(
          () =>
            setModalConfig({
              isOpen: true,
              role: finalStrikerId === undefined ? "Striker" : "Non-Striker",
            }),
          800,
        );
      }

      if (isLegal && ballsInOver === 5) {
        setPreviousBowlerId(activeBowler!.id);
        setActiveBowler(null);
        setTimeout(() => {
          setThisOverTimeline([]);
          if (!isWicket) setModalConfig({ isOpen: true, role: "Bowler" });
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to record ball");
    }
  };

  const confirmDeclare = async () => {
    setIsDeclareModalOpen(false);
    setIsInningsDeclared(true);
    try {
      await api.post(`/scoring/innings/${liveStats.innings_id}/complete`);
      fetchLiveScoreboard();
    } catch (err) {
      toast.error("Failed to complete innings.");
    }
  };

  const handleFinalizeMatch = async () => {
    try {
      await api.post(`/scoring/match/${matchId}/complete`);
      navigate(`/match/${matchId}`);
    } catch (err) {
      toast.error("Failed to complete match.");
    }
  };

  const handlePlayerSelect = (player: Player) => {
    if (modalConfig.role === "Striker") setActiveStriker(player);
    if (modalConfig.role === "Non-Striker") setActiveNonStriker(player);
    if (modalConfig.role === "Bowler") setActiveBowler(player);
    setModalConfig({ isOpen: false, role: null });
  };

  if (!matchData)
    return (
      <div className="p-8 text-center animate-pulse text-foreground">
        Loading match...
      </div>
    );

  const canUpdateScore =
    user?.id &&
    (user.id === matchData.created_by || user.id === matchData.umpire_id);
  const showPlayerSelection = canUpdateScore && !isCurrentInningsOver;

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      <FullScreenEvent
        eventType={currentEvent}
        onComplete={() => setCurrentEvent(null)}
      />

      <DeclareModal
        isOpen={isDeclareModalOpen}
        score={currentTotalScore}
        wickets={currentWickets}
        overs={oversDisplay}
        onConfirm={confirmDeclare}
        onCancel={() => setIsDeclareModalOpen(false)}
      />

      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Live Match</h1>
        </div>
        {canUpdateScore && hasInningsStarted && !isCurrentInningsOver && (
          <button
            onClick={() => setIsDeclareModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold bg-red-900/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-900/60 transition-colors"
          >
            <AlertOctagon className="w-4 h-4" /> Declare
          </button>
        )}
      </div>

      <ScoreHeader
        battingTeam={matchData.team_a_name}
        score={currentTotalScore}
        wickets={currentWickets}
        overs={oversDisplay}
      />

      <div className="px-4 mt-4 space-y-4">
        {/* ========================================== */}
        {/* STATE 1: ACTIVE SCORING (INNINGS ONGOING)  */}
        {/* ========================================== */}
        {!isCurrentInningsOver &&
        matchData.status !== "completed" &&
        hasInningsStarted ? (
          <>
            {showPlayerSelection && (
              <div className="mb-2">
                <div className="flex gap-2 mb-2 animate-fade-in">
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, role: "Striker" })
                    }
                    className={`flex-1 py-2 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${!activeStriker ? "bg-primary border-primary text-background animate-pulse" : "bg-card border-border text-primary"}`}
                  >
                    <UserPlus className="w-3 h-3" />{" "}
                    {activeStriker ? activeStriker.name : "Pick Striker"}
                  </button>
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, role: "Non-Striker" })
                    }
                    className={`flex-1 py-2 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${!activeNonStriker ? "bg-primary border-primary text-background animate-pulse" : "bg-card border-border text-primary"}`}
                  >
                    <UserPlus className="w-3 h-3" />{" "}
                    {activeNonStriker
                      ? activeNonStriker.name
                      : "Pick Non-Striker"}
                  </button>
                  <button
                    onClick={() =>
                      setModalConfig({ isOpen: true, role: "Bowler" })
                    }
                    className={`flex-1 py-2 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${!activeBowler ? "bg-destructive border-destructive text-background animate-pulse" : "bg-card border-border text-destructive"}`}
                  >
                    <UserPlus className="w-3 h-3" />{" "}
                    {activeBowler ? activeBowler.name : "Pick Bowler"}
                  </button>
                </div>
              </div>
            )}

            <PlayerStats
              strikerName={
                activeStriker?.name || liveStats?.striker_name || "Pick Striker"
              }
              strikerRuns={getBatterStats(activeStriker?.id).runs}
              strikerBalls={getBatterStats(activeStriker?.id).balls}
              nonStrikerName={
                activeNonStriker?.name ||
                liveStats?.non_striker_name ||
                "Pick Non-Striker"
              }
              nonStrikerRuns={getBatterStats(activeNonStriker?.id).runs}
              nonStrikerBalls={getBatterStats(activeNonStriker?.id).balls}
              bowlerName={
                activeBowler?.name || liveStats?.bowler_name || "Pick Bowler"
              }
              bowlerRuns={
                activeBowler?.id === liveStats?.bowler_id
                  ? liveStats?.bowler_runs || 0
                  : 0
              }
              bowlerWickets={
                activeBowler?.id === liveStats?.bowler_id
                  ? liveStats?.bowler_wickets || 0
                  : 0
              }
              partnershipRuns={liveStats?.partnership_runs || 0}
              partnershipBalls={liveStats?.partnership_balls || 0}
            />

            {liveStats?.recent_balls?.length > 0 && (
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Last 15 Balls</span>
                  <span className="text-primary font-black">
                    {oversDisplay} Overs
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {liveStats.recent_balls.map((ball: string, i: number) => {
                    let bgColor = "bg-muted text-muted-foreground"; // Dots
                    if (ball === "W")
                      bgColor = "bg-destructive text-white shadow-sm";
                    else if (ball.includes("wd") || ball.includes("nb"))
                      bgColor = "bg-warning text-warning-foreground font-black";
                    else if (ball === "4" || ball === "6")
                      bgColor =
                        "bg-primary text-primary-foreground font-black shadow-sm";
                    else if (ball !== "0")
                      bgColor =
                        "bg-card text-foreground border border-primary/30"; // 1s, 2s

                    return (
                      <span
                        key={i}
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${bgColor}`}
                      >
                        {ball}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {canUpdateScore ? (
              <div className="mt-6 animate-fade-in">
                {showWicketForm ? (
                  <WicketForm
                    bowlingSquad={bowlingSquad}
                    onSubmit={handleWicketSubmit}
                    onCancel={() => setShowWicketForm(false)}
                  />
                ) : (
                  <ScoringPad
                    onScore={handleBall}
                    modifier={modifier}
                    setModifier={setModifier}
                    isFreeHit={isFreeHit}
                    onComplete={() => setIsDeclareModalOpen(true)}
                    onRetire={() => {
                      setActiveStriker(null);
                      setModalConfig({ isOpen: true, role: "Striker" });
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="mt-8 p-6 bg-card border border-border rounded-2xl text-center">
                <Lock className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="text-foreground">Read-Only View</h3>
              </div>
            )}
          </>
        ) : (
          /* ========================================== */
          /* STATE 2: BREAKS & COMPLETION SCREENS       */
          /* ========================================== */
          <div className="mt-6 animate-fade-in">
            {!hasInningsStarted && matchData.status !== "completed" ? (
              <div className="bg-card p-6 rounded-3xl border border-border shadow-lg text-center flex items-center justify-center min-h-[200px]">
                <button
                  onClick={handleStartInnings}
                  className="w-full bg-primary hover:bg-primary/90 text-background font-black text-xl py-6 rounded-2xl shadow-md transition-transform active:scale-95"
                >
                  START 1ST INNINGS
                </button>
              </div>
            ) : matchData.status === "completed" ? (
              <div className="bg-card p-8 rounded-3xl border-2 border-primary/30 text-center shadow-xl flex flex-col items-center justify-center min-h-[200px]">
                <h2 className="text-3xl font-black text-primary mb-3 uppercase tracking-widest">
                  Match Over
                </h2>
                <p className="text-muted-foreground font-medium">
                  This match has been finalized and stats are saved.
                </p>
              </div>
            ) : (
              <div className="bg-card p-8 rounded-3xl border-2 border-warning/50 text-center shadow-xl flex flex-col items-center justify-center min-h-[200px]">
                <h2 className="text-3xl font-black text-warning mb-2 uppercase tracking-widest">
                  Innings Break
                </h2>
                <p className="text-muted-foreground mb-8 font-medium">
                  Players are resting. Click below when ready to resume.
                </p>

                {canUpdateScore &&
                  (!isSecondInnings ? (
                    <button
                      onClick={handleStartInnings}
                      className="bg-primary text-background py-5 px-8 rounded-2xl font-black text-lg w-full shadow-lg transition-transform active:scale-95"
                    >
                      START 2ND INNINGS
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalizeMatch}
                      className="bg-destructive hover:bg-destructive/90 transition-all text-background py-5 px-8 rounded-2xl font-black text-lg w-full shadow-lg active:scale-95"
                    >
                      FINALIZE MATCH
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PlayerSelectModal
        isOpen={modalConfig.isOpen}
        role={modalConfig.role}
        squad={modalConfig.role === "Bowler" ? bowlingSquad : battingSquad}
        currentlyPlayingIds={
          [
            activeStriker?.id,
            activeNonStriker?.id,
            activeBowler?.id,
            modalConfig.role === "Bowler" ? previousBowlerId : null,
          ].filter(Boolean) as string[]
        }
        onSelect={handlePlayerSelect}
        onClose={() => setModalConfig({ isOpen: false, role: null })}
      />
    </div>
  );
};

export default LiveScoring;
