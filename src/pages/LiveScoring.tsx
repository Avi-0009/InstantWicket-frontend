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

  // 🔴 DEBUG STATE
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

  useEffect(() => {
    if (isPreparingSecondInnings) {
      setActiveStriker(null);
      setActiveNonStriker(null);
      setActiveBowler(null);
      setPreviousBowlerId(null);
    }
  }, [isPreparingSecondInnings]);

  const overs = liveStats ? Math.floor((liveStats.legal_balls || 0) / 6) : 0;
  const ballsInOver = liveStats ? (liveStats.legal_balls || 0) % 6 : 0;
  const oversDisplay = Number(`${overs}.${ballsInOver}`);

  const getPlayerName = (id: string, role: "batter" | "bowler") => {
    if (!id) return null;
    const squad = role === "batter" ? battingSquad : bowlingSquad;
    const player = squad.find((p: Player) => p.id === id);
    return player ? player.name : null;
  };

  const displayStriker =
    activeStriker?.name ||
    (!isPreparingSecondInnings
      ? getPlayerName(liveStats?.striker_id, "batter")
      : null) ||
    (!isPreparingSecondInnings ? liveStats?.striker_name : null) ||
    "Select Striker";
  const displayNonStriker =
    activeNonStriker?.name ||
    (!isPreparingSecondInnings
      ? getPlayerName(liveStats?.non_striker_id, "batter")
      : null) ||
    (!isPreparingSecondInnings ? liveStats?.non_striker_name : null) ||
    "Select Non-Striker";
  const displayBowler =
    activeBowler?.name ||
    (!isPreparingSecondInnings
      ? getPlayerName(liveStats?.bowler_id, "bowler")
      : null) ||
    (!isPreparingSecondInnings ? liveStats?.bowler_name : null) ||
    "Select Bowler";

  // const handleStartInnings = async () => {
  //   if (!activeStriker || !activeNonStriker || !activeBowler) {
  //     toast.error("Please assign a Striker, Non-Striker, and Bowler first!", {
  //       duration: 2000,
  //     });
  //     return;
  //   }

  //   const currentInningsNo = isPreparingSecondInnings ? 2 : 1;
  //   const targetToSet = isPreparingSecondInnings
  //     ? (liveStats?.current_score || 0) + 1
  //     : null;

  //   const payload = {
  //     match_id: matchId,
  //     batting_team_id: isTeamABatting
  //       ? matchData.team_a_id
  //       : matchData.team_b_id,
  //     bowling_team_id: isTeamABatting
  //       ? matchData.team_b_id
  //       : matchData.team_a_id,
  //     striker_id: activeStriker.id,
  //     non_striker_id: activeNonStriker.id,
  //     bowler_id: activeBowler.id,
  //     innings_no: currentInningsNo,
  //     target_runs: targetToSet,
  //   };

  //   const loadingToast = toast.loading(
  //     `Starting Innings ${currentInningsNo}...`,
  //   );
  //   try {
  //     const res = await api.post("/scoring/start", payload);
  //     toast.success(`Innings ${currentInningsNo} Started!`, {
  //       id: loadingToast,
  //       duration: 1500,
  //     });

  //     setIsInningsDeclared(false);

  //     // 🔴 IMMEDIATE UI SWITCH: This forces the Scoring Pad to appear instantly
  //     setLiveStats((prev: any) => ({
  //       ...prev,
  //       innings_id: res.data?.innings_id || res.data?.id || "active-innings",
  //       innings_no: currentInningsNo,
  //       legal_balls: prev?.legal_balls || 0,
  //       current_score: prev?.current_score || 0,
  //       wickets: prev?.wickets || 0,
  //       striker_id: activeStriker.id,
  //       non_striker_id: activeNonStriker.id,
  //       bowler_id: activeBowler.id,
  //     }));

  //     fetchLiveScoreboard();
  //   } catch (error: any) {
  //     const msg = error.response?.data?.error || "Failed to start innings";
  //     toast.error(msg, { id: loadingToast, duration: 2500 });
  //   }
  // };
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

      // INSTANT UI SWITCH
      setLiveStats((prev: any) => ({
        ...prev,
        innings_id:
          res.data?.innings_id || res.data?.id || "active-innings-bypass",
        innings_no: currentInningsNo,
        legal_balls: 0,
        current_score: 0,
        wickets: 0,
        striker_id: activeStriker.id,
        non_striker_id: activeNonStriker.id,
        bowler_id: activeBowler.id,
      }));

      // 🚨 REMOVED fetchLiveScoreboard() FROM HERE!
      // This is what was causing the screen to glitch back to the start button.
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to start innings";
      toast.error(msg, { id: loadingToast, duration: 2500 });
    }
  };
  const handleBall = (runs: number, isWicket: boolean = false) => {
    if (!liveStats?.innings_id) {
      return toast.error("Innings has not been started yet!", {
        duration: 1500,
      });
    }

    if (
      liveStats.legal_balls > 0 &&
      liveStats.legal_balls % 6 === 0 &&
      !activeBowler
    ) {
      toast.error("Over complete! Please select a new bowler.", {
        duration: 2000,
      });
      setModalConfig({ isOpen: true, role: "Bowler" });
      return;
    }

    if (isWicket) {
      setPendingRuns(runs);
      setShowWicketForm(true);
      return;
    }

    // 🔴 FIX: Added the 5th argument (null for outPlayerId, null for fielderId)
    executeBallApi(runs, false, null, null, null);
  };

  const handleWicketSubmit = (
    wicketType: string,
    outBatterRole: "striker" | "non_striker",
    fielderId: string | null,
  ) => {
    // Figure out the exact ID of the player who got out based on the selection
    const exactOutPlayerId =
      outBatterRole === "striker" ? activeStriker?.id : activeNonStriker?.id;

    // Pass it to the API
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

    const currentStrikerId = activeStriker?.id || liveStats.striker_id;
    const currentNonStrikerId =
      activeNonStriker?.id || liveStats.non_striker_id;
    const currentBowlerId = activeBowler?.id || liveStats.bowler_id;

    // GUARANTEED FIELDS ONLY - This stops Go from panicking on nulls
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

    // OPTIONAL FIELDS - Only attach them if they actually have data
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

      if (isLegal && ballsInOver === 5) {
        shouldSwapStrikers = !shouldSwapStrikers;
        setPreviousBowlerId(currentBowlerId);
        setActiveBowler(null);

        setTimeout(() => {
          toast("Over Complete! Select new bowler.", {
            icon: "🏏",
            duration: 3000,
          });
          setModalConfig({ isOpen: true, role: "Bowler" });
        }, 1000);
      }

      if (shouldSwapStrikers) {
        const nextStriker =
          battingSquad.find((p: Player) => p.id === currentNonStrikerId) ||
          null;
        const nextNonStriker =
          battingSquad.find((p: Player) => p.id === currentStrikerId) || null;
        setActiveStriker(nextStriker);
        setActiveNonStriker(nextNonStriker);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to record ball", {
        id: loadingToast,
        duration: 1500,
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
      toast.error("Failed to complete innings.", {
        id: loadingToast,
        duration: 1500,
      });
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
      <div className="text-foreground p-8 text-center animate-pulse">
        Loading match...
      </div>
    );

  const canUpdateScore =
    user?.id &&
    (user.id === matchData.created_by || user.id === matchData.umpire_id);

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
        {canUpdateScore && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setModalConfig({ isOpen: true, role: "Striker" })}
              className="flex-1 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-primary hover:bg-border transition-colors flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Striker
            </button>
            <button
              onClick={() =>
                setModalConfig({ isOpen: true, role: "Non-Striker" })
              }
              className="flex-1 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-primary hover:bg-border transition-colors flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Non-Striker
            </button>
            <button
              onClick={() => setModalConfig({ isOpen: true, role: "Bowler" })}
              className="flex-1 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-destructive hover:bg-border transition-colors flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Bowler
            </button>
          </div>
        )}

        <PlayerStats
          striker={displayStriker}
          nonStriker={displayNonStriker}
          bowler={displayBowler}
        />

        <OverTimeline thisOver={[]} />

        {canUpdateScore ? (
          <div className="mt-6 animate-fade-in">
            {!liveStats?.innings_id ? (
              <button
                onClick={handleStartInnings}
                className="w-full bg-primary hover:bg-primary-hover text-background transition-colors font-bold text-xl py-6 rounded-xl shadow-[0_0_15px_rgba(15,175,154,0.2)]"
              >
                START 1ST INNINGS
              </button>
            ) : isCurrentInningsOver ? (
              <div className="bg-card p-6 rounded-2xl border-2 border-warning/50 text-center shadow-lg animate-bounce-in">
                <h2 className="text-2xl font-black text-warning mb-2">
                  INNINGS OVER
                </h2>
                <p className="text-muted-foreground font-bold mb-6">
                  {isAllOut && "The batting team is All Out!"}
                  {isOversDone && !isAllOut && "All overs have been bowled!"}
                  {isTargetReached && "Target reached! What a chase!"}
                  {isInningsDeclared &&
                    !isAllOut &&
                    !isOversDone &&
                    "Innings was declared by the host."}
                </p>

                {!isSecondInnings ? (
                  <button
                    onClick={handleStartInnings}
                    className="bg-primary hover:bg-primary-hover text-background py-4 px-6 rounded-xl font-bold w-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(15,175,154,0.2)] transition-all"
                  >
                    START 2ND INNINGS
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      toast.success("Match complete API coming next!")
                    }
                    className="bg-destructive hover:bg-destructive/90 text-background py-4 px-6 rounded-xl font-bold w-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,107,107,0.3)] transition-all"
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
                onRetire={() =>
                  toast("Retire feature coming up!", { icon: "🏏" })
                }
                onComplete={() => setIsDeclareModalOpen(true)}
              />
            )}
          </div>
        ) : (
          <div className="mt-8 p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
            <Lock className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-foreground font-bold mb-1">Read-Only View</h3>
          </div>
        )}
      </div>

      <PlayerSelectModal
        isOpen={modalConfig.isOpen}
        role={modalConfig.role}
        squad={modalConfig.role === "Bowler" ? bowlingSquad : battingSquad}
        currentlyPlayingIds={
          [
            activeStriker?.id || liveStats?.striker_id,
            activeNonStriker?.id || liveStats?.non_striker_id,
            activeBowler?.id || liveStats?.bowler_id,
            modalConfig.role === "Bowler" ? previousBowlerId : null,
          ].filter(Boolean) as string[]
        }
        onSelect={handlePlayerSelect}
        onClose={() => setModalConfig({ isOpen: false, role: null })}
      />

      <div className="px-4 mt-12 mb-8">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 text-xs text-muted-foreground border border-border px-3 py-2 rounded-lg hover:text-white"
        >
          <Bug className="w-4 h-4" /> Show Backend Data
        </button>
        {showDebug && (
          <pre className="mt-2 p-4 bg-black border border-red-500 rounded-lg text-red-400 text-[10px] overflow-x-auto whitespace-pre-wrap">
            {debugLog}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LiveScoring;
