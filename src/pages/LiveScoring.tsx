import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, AlertOctagon, UserPlus, Bug } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../Api/Auth";
import toast from "react-hot-toast";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
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
  const [hasSynced, setHasSynced] = useState(false); // Prevents infinite overwriting

  const [debugLog, setDebugLog] = useState<string>("Waiting for data...");
  const [showDebug, setShowDebug] = useState(false);

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

  const [showWicketForm, setShowWicketForm] = useState(false);
  const [pendingRuns, setPendingRuns] = useState(0);

  const fetchLiveScoreboard = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await api.get(`/scoring/live/${matchId}`);
      if (res.data && Object.keys(res.data).length > 0) {
        setLiveStats(res.data);
      }
    } catch (error: any) {
      console.error("Live Scoreboard Error:", error);
    }
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

        const playersA = match.team_a_players || [];
        const playersB = match.team_b_players || [];
        setDebugLog(JSON.stringify({ playersA, playersB }, null, 2));

        if (playersA.length === 0 || playersB.length === 0) {
          toast.error("Match loaded, but players are missing!", {
            duration: 4000,
          });
        }
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

  const targetRuns = liveStats?.target_runs || liveStats?.required_runs || 0;
  const isSecondInnings = liveStats?.innings_no === 2 || targetRuns > 0;

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

  const isAllOut = liveStats?.wickets >= maxWickets && maxWickets > 0;
  const isOversDone = maxBalls > 0 && liveStats?.legal_balls >= maxBalls;
  const isTargetReached =
    isSecondInnings && liveStats?.current_score >= targetRuns && targetRuns > 0;

  const isCurrentInningsOver =
    !!liveStats?.innings_id &&
    (isAllOut || isOversDone || isTargetReached || isInningsDeclared);
  const isPreparingSecondInnings =
    !!liveStats?.innings_id && isCurrentInningsOver && !isSecondInnings;

  const shouldFlipTeams = isSecondInnings || isPreparingSecondInnings;
  const isTeamABatting = shouldFlipTeams
    ? !tossWinnerBatting
    : tossWinnerBatting;

  const battingSquad: Player[] = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingSquad: Player[] = isTeamABatting ? teamBPlayers : teamAPlayers;

  // 🔴 SYNC ONLY ONCE ON LOAD 🔴
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
      setHasSynced(false); // Reset sync for the new innings
    }
  }, [isPreparingSecondInnings]);

  const overs = liveStats ? Math.floor((liveStats.legal_balls || 0) / 6) : 0;
  const ballsInOver = liveStats ? (liveStats.legal_balls || 0) % 6 : 0;
  const oversDisplay = Number(`${overs}.${ballsInOver}`);

  // const getPlayerName = (id: string, role: "batter" | "bowler") => {
  //   if (!id) return null;
  //   const squad = role === "batter" ? battingSquad : bowlingSquad;
  //   const player = squad.find((p: Player) => p.id === id);
  //   return player ? player.name : null;
  // };

  // const displayStriker =
  //   activeStriker?.name ||
  //   (!isPreparingSecondInnings
  //     ? getPlayerName(liveStats?.striker_id, "batter")
  //     : null) ||
  //   (!isPreparingSecondInnings ? liveStats?.striker_name : null) ||
  //   "Missing Striker";
  // const displayNonStriker =
  //   activeNonStriker?.name ||
  //   (!isPreparingSecondInnings
  //     ? getPlayerName(liveStats?.non_striker_id, "batter")
  //     : null) ||
  //   (!isPreparingSecondInnings ? liveStats?.non_striker_name : null) ||
  //   "Missing Non-Striker";
  // const displayBowler =
  //   activeBowler?.name ||
  //   (!isPreparingSecondInnings
  //     ? getPlayerName(liveStats?.bowler_id, "bowler")
  //     : null) ||
  //   (!isPreparingSecondInnings ? liveStats?.bowler_name : null) ||
  //   "Missing Bowler";
  const formatBatterStr = (
    localPlayer: Player | null,
    backendId: string,
    backendName: string,
    runs: number,
    balls: number,
  ) => {
    if (localPlayer) {
      if (localPlayer.id === backendId)
        return `${localPlayer.name} (${runs || 0} off ${balls || 0})`;
      return `${localPlayer.name} (0 off 0)`; // Newly selected batter
    }
    if (backendId && backendName)
      return `${backendName} (${runs || 0} off ${balls || 0})`;
    return "Pick Batter";
  };

  const displayStriker = !isPreparingSecondInnings
    ? formatBatterStr(
        activeStriker,
        liveStats?.striker_id,
        liveStats?.striker_name,
        liveStats?.striker_runs,
        liveStats?.striker_balls,
      )
    : activeStriker?.name || "Pick Striker";

  const displayNonStriker = !isPreparingSecondInnings
    ? formatBatterStr(
        activeNonStriker,
        liveStats?.non_striker_id,
        liveStats?.non_striker_name,
        liveStats?.non_striker_runs,
        liveStats?.non_striker_balls,
      )
    : activeNonStriker?.name || "Pick Non-Striker";

  const displayBowler = activeBowler
    ? activeBowler.id === liveStats?.bowler_id
      ? `${activeBowler.name} (${liveStats?.bowler_wickets || 0}-${liveStats?.bowler_runs || 0})`
      : `${activeBowler.name} (0-0)`
    : liveStats?.bowler_name
      ? `${liveStats?.bowler_name} (${liveStats?.bowler_wickets || 0}-${liveStats?.bowler_runs || 0})`
      : "Pick Bowler";

  const handleStartInnings = async () => {
    if (!activeStriker || !activeNonStriker || !activeBowler) {
      toast.error("Please assign a Striker, Non-Striker, and Bowler first!", {
        duration: 1200,
      });
      return;
    }

    const currentInningsNo = isPreparingSecondInnings ? 2 : 1;
    const targetToSet = isPreparingSecondInnings
      ? (liveStats?.current_score || 0) + 1
      : null;

    const payload = {
      match_id: matchId,
      batting_team_id: isTeamABatting
        ? matchData.team_a_id
        : matchData.team_b_id,
      bowling_team_id: isTeamABatting
        ? matchData.team_b_id
        : matchData.team_a_id,
      striker_id: activeStriker.id,
      non_striker_id: activeNonStriker.id,
      bowler_id: activeBowler.id,
      innings_no: currentInningsNo,
      target_runs: targetToSet,
    };

    const loadingToast = toast.loading(
      `Starting Innings ${currentInningsNo}...`,
    );
    try {
      const res = await api.post("/scoring/start", payload);
      toast.success(`Innings ${currentInningsNo} Started!`, {
        id: loadingToast,
        duration: 1500,
      });
      setIsInningsDeclared(false);

      setLiveStats((prev: any) => ({
        ...prev,
        innings_id: res.data?.data || prev?.innings_id,
        innings_no: currentInningsNo,
        legal_balls: 0,
        current_score: 0,
        wickets: 0,
        striker_id: activeStriker.id,
        non_striker_id: activeNonStriker.id,
        bowler_id: activeBowler.id,
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start innings", {
        id: loadingToast,
        duration: 2500,
      });
    }
  };

  const handleBall = (runs: number, isWicket: boolean = false) => {
    if (!liveStats?.innings_id)
      return toast.error("Innings has not started yet!");

    // Block scoring if someone is missing (e.g. over ended, or wicket fell)
    if (!activeStriker || !activeNonStriker || !activeBowler) {
      return toast.error("Please assign missing players before scoring!", {
        duration: 1500,
      });
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

    const currentStrikerId = activeStriker?.id;
    const currentNonStrikerId = activeNonStriker?.id;
    const currentBowlerId = activeBowler?.id;

    const payload: any = {
      match_id: matchId,
      innings_id: liveStats.innings_id,
      over_number: overs,
      ball_number: ballsInOver + 1,
      striker_id: currentStrikerId,
      non_striker_id: currentNonStrikerId,
      bowler_id: currentBowlerId,
      is_legal_ball: isLegal,
      runs_from_bat: runsFromBat,
      extras: extras,
      is_wicket: isWicket,
    };

    if (extraType) payload.extra_type = extraType;
    if (wicketType) payload.wicket_type = wicketType;
    if (isWicket && outPlayerId) payload.out_player_id = outPlayerId;
    if (fielderId) payload.fielder_id = fielderId;

    const loadingToast = toast.loading("Recording ball...");
    try {
      await api.post("/scoring/ball", payload);
      toast.success(isWicket ? "Wicket recorded!" : "Ball recorded", {
        id: loadingToast,
        duration: 1000,
      });
      setModifier(null);
      await fetchLiveScoreboard();

      let shouldSwapStrikers = false;
      if (runsFromBat % 2 !== 0) shouldSwapStrikers = !shouldSwapStrikers;
      if (isLegal && ballsInOver === 5)
        shouldSwapStrikers = !shouldSwapStrikers;

      let finalStrikerId = currentStrikerId;
      let finalNonStrikerId = currentNonStrikerId;

      // 1. Calculate crossing first
      if (shouldSwapStrikers) {
        finalStrikerId = currentNonStrikerId;
        finalNonStrikerId = currentStrikerId;
      }

      // 2. Remove the out player AFTER crossing is calculated
      if (isWicket && outPlayerId) {
        if (finalStrikerId === outPlayerId) finalStrikerId = undefined;
        if (finalNonStrikerId === outPlayerId) finalNonStrikerId = undefined;
      }

      // 3. Update active states (nulls out the missing player)
      setActiveStriker(
        battingSquad.find((p) => p.id === finalStrikerId) || null,
      );
      setActiveNonStriker(
        battingSquad.find((p) => p.id === finalNonStrikerId) || null,
      );

      // 4. Trigger UI popups for missing players
      if (isWicket && outPlayerId) {
        setTimeout(() => {
          setModalConfig({
            isOpen: true,
            role: finalStrikerId === undefined ? "Striker" : "Non-Striker",
          });
        }, 800);
      }

      if (isLegal && ballsInOver === 5) {
        setPreviousBowlerId(currentBowlerId!);
        setActiveBowler(null); // Clear bowler for next over
        setTimeout(() => {
          toast("Over Complete! Select new bowler.", {
            icon: "🏏",
            duration: 3000,
          });
          if (!isWicket) setModalConfig({ isOpen: true, role: "Bowler" });
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to record ball", {
        id: loadingToast,
        duration: 1000,
      });
    }
  };

  const confirmDeclare = async () => {
    setIsDeclareModalOpen(false);
    setIsInningsDeclared(true);
    const loadingToast = toast.loading("Ending Innings...");
    try {
      await api.post(`/scoring/innings/${liveStats.innings_id}/complete`);
      toast.success("Innings Completed!", { id: loadingToast, duration: 1500 });
      fetchLiveScoreboard();
    } catch (err) {
      toast.error("Failed to complete innings.");
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
      <div className="p-8 text-center animate-pulse">Loading match...</div>
    );

  const canUpdateScore =
    user?.id &&
    (user.id === matchData.created_by || user.id === matchData.umpire_id);

  // 🔴 CONDITIONAL VISIBILITY TRIGGER 🔴
  // Only shows the buttons if we are starting a match OR if someone is missing (wicket/over change)
  const needsPlayerAssignment =
    !activeStriker || !activeNonStriker || !activeBowler;
  const showPlayerSelection =
    canUpdateScore &&
    (!liveStats?.innings_id ||
      isPreparingSecondInnings ||
      needsPlayerAssignment);

  return (
    <div className="min-h-screen bg-background pb-8 relative">
      <FullScreenEvent
        eventType={currentEvent}
        onComplete={() => setCurrentEvent(null)}
      />
      <DeclareModal
        isOpen={isDeclareModalOpen}
        score={liveStats?.current_score || 0}
        wickets={liveStats?.wickets || 0}
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
        {canUpdateScore && (
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
        score={liveStats?.current_score || 0}
        wickets={liveStats?.wickets || 0}
        overs={oversDisplay}
      />

      <div className="px-4 mt-4 space-y-4">
        {/* PLAYER ASSIGNMENT ROW - Appears ONLY when needed */}
        {showPlayerSelection && (
          <div className="flex gap-2 mb-2 animate-fade-in">
            <button
              onClick={() => setModalConfig({ isOpen: true, role: "Striker" })}
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
              {activeNonStriker ? activeNonStriker.name : "Pick Non-Striker"}
            </button>
            <button
              onClick={() => setModalConfig({ isOpen: true, role: "Bowler" })}
              className={`flex-1 py-2 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${!activeBowler ? "bg-destructive border-destructive text-background animate-pulse" : "bg-card border-border text-destructive"}`}
            >
              <UserPlus className="w-3 h-3" />{" "}
              {activeBowler ? activeBowler.name : "Pick Bowler"}
            </button>
          </div>
        )}

        <PlayerStats
          striker={displayStriker}
          nonStriker={displayNonStriker}
          bowler={displayBowler}
        />
        <OverTimeline thisOver={liveStats?.this_over || []} />

        {canUpdateScore ? (
          <div className="mt-6 animate-fade-in">
            {!liveStats?.innings_id ? (
              <button
                onClick={handleStartInnings}
                className="w-full bg-primary hover:bg-primary-hover text-background font-bold text-xl py-6 rounded-xl"
              >
                START 1ST INNINGS
              </button>
            ) : isCurrentInningsOver ? (
              <div className="bg-card p-6 rounded-2xl border-2 border-warning/50 text-center shadow-lg">
                <h2 className="text-2xl font-black text-warning mb-2">
                  INNINGS OVER
                </h2>
                {!isSecondInnings ? (
                  <button
                    onClick={handleStartInnings}
                    className="bg-primary text-background py-4 px-6 rounded-xl font-bold w-full"
                  >
                    START 2ND INNINGS
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      toast.success("Match complete API coming next!")
                    }
                    className="bg-destructive text-background py-4 px-6 rounded-xl font-bold w-full"
                  >
                    FINALIZE MATCH
                  </button>
                )}
              </div>
            ) : showWicketForm ? (
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
                  // Allows manual retirement / swapping mid-over
                  setActiveStriker(null);
                  setModalConfig({ isOpen: true, role: "Striker" });
                }}
              />
            )}
          </div>
        ) : (
          <div className="mt-8 p-6 bg-card border border-border rounded-2xl text-center">
            <Lock className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3>Read-Only View</h3>
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
