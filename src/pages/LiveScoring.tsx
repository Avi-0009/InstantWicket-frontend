import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Lock,
  AlertOctagon,
  RotateCcw,
  UserX,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../Api/Auth";
import toast from "react-hot-toast";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import ScoringPad from "../components/scoring/ScoringPad";
import CustomDropdown from "../components/scoring/CustomDropdown";
import { FullScreenEvent } from "../components/scoring/FullScreenEvent";
import { WicketForm } from "../components/scoring/WicketForm";
import { DeclareModal } from "../components/scoring/DeclareModal";
import OverTimeline from "../components/scoring/OverTimeline";

export interface Player {
  id: string;
  name: string;
}

interface LiveStats {
  innings_id: string;
  innings_no: number;
  batting_team_id: string;
  bowling_team_id: string;
  legal_balls: number;
  current_score: number;
  wickets: number;
  striker_id?: string;
  striker_runs?: number;
  striker_balls?: number;
  striker_name?: string;
  non_striker_id?: string;
  non_striker_runs?: number;
  non_striker_balls?: number;
  non_striker_name?: string;
  bowler_id?: string;
  bowler_runs?: number;
  bowler_wickets?: number;
  bowler_name?: string;
  partnership_runs?: number;
  partnership_balls?: number;
  target_runs: number;
  required_runs: number;
  recent_balls?: string[];
}

interface ScorecardItem {
  player_id: string;
  is_out: boolean;
  team_id?: string;
  batting_team_id?: string;
  innings_id?: string;
  balls_played?: number;
  runs_scored?: number;
}

interface BallPayload {
  match_id: string;
  innings_id: string;
  over_number: number;
  ball_number: number;
  striker_id?: string;
  non_striker_id?: string;
  bowler_id?: string;
  is_legal_ball: boolean;
  runs_from_bat: number;
  extras: number;
  is_wicket: boolean;
  extra_type?: string;
  wicket_type?: string;
  out_player_id?: string;
  fielder_id?: string;
  partnership_runs?: number;
  partnership_balls?: number;
}

// interface ApiError {
//   response?: { data?: { error?: string } };
// }

const LiveScoring = () => {
  // 🔥 MOVED HERE: Hooks must be inside the component!
  const queryClient = useQueryClient();

  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [hasSynced, setHasSynced] = useState(false);

  const [modifier, setModifier] = useState<"WD" | "NB" | "BYE" | "LB" | null>(
    null,
  );
  const [isFreeHit, setIsFreeHit] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const [eventQueue, setEventQueue] = useState<
    ("4" | "6" | "FREE_HIT" | "WICKET")[]
  >([]);
  const currentEvent = eventQueue[0] || null;

  const [activeStriker, setActiveStriker] = useState<Player | null>(null);
  const [activeNonStriker, setActiveNonStriker] = useState<Player | null>(null);
  const [activeBowler, setActiveBowler] = useState<Player | null>(null);
  const [previousBowlerId, setPreviousBowlerId] = useState<string | null>(null);

  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isInningsDeclared, setIsInningsDeclared] = useState(false);
  const [showWicketForm, setShowWicketForm] = useState(false);
  const [showRetireForm, setShowRetireForm] = useState(false);

  const milestones = useRef<
    Record<string, { thirty: boolean; fifty: boolean; hundred: boolean }>
  >({});

  const { data: matchData } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const res = await api.get(`/matches/${matchId}`);
      return res.data.match || res.data;
    },
    refetchInterval: 5000,
  });

  const { data: fetchedLiveStats, refetch: refetchLiveStats } = useQuery({
    queryKey: ["liveScoreboard", matchId],
    queryFn: async () => {
      const res = await api.get(`/scoring/live/${matchId}`);
      return res.data as LiveStats;
    },
    refetchInterval: 3000,
  });

  const { data: scorecard = [] } = useQuery({
    queryKey: ["scorecard", matchId],
    queryFn: async () => {
      const res = await api.get(`/scoring/scorecard/${matchId}`);
      return (res.data.scorecard || []) as ScorecardItem[];
    },
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (fetchedLiveStats && Object.keys(fetchedLiveStats).length > 0) {
      setLiveStats(fetchedLiveStats);
      const strikerId = fetchedLiveStats.striker_id;
      const strikerRuns = fetchedLiveStats.striker_runs || 0;
      const strikerName = fetchedLiveStats.striker_name;

      if (strikerId) {
        if (!milestones.current[strikerId])
          milestones.current[strikerId] = {
            thirty: false,
            fifty: false,
            hundred: false,
          };
        if (strikerRuns >= 100 && !milestones.current[strikerId].hundred) {
          toast.success(`🎉 CENTURY! 100 by ${strikerName}!`);
          milestones.current[strikerId].hundred = true;
        } else if (
          strikerRuns >= 50 &&
          strikerRuns < 100 &&
          !milestones.current[strikerId].fifty
        ) {
          toast.success(`🔥 HALF-CENTURY for ${strikerName}!`);
          milestones.current[strikerId].fifty = true;
        } else if (
          strikerRuns >= 30 &&
          strikerRuns < 50 &&
          !milestones.current[strikerId].thirty
        ) {
          toast.success(`Solid 30 by ${strikerName}!`);
          milestones.current[strikerId].thirty = true;
        }
      }
    }
  }, [fetchedLiveStats]);

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

  const currentWickets = liveStats?.wickets || 0;
  const currentLegalBalls = liveStats?.legal_balls || 0;
  const currentTotalScore = liveStats?.current_score || 0;

  const isAllOut = currentWickets >= maxWickets && maxWickets > 0;
  const isOversDone =
    (matchData?.overs_limit || 0) * 6 > 0 &&
    currentLegalBalls >= (matchData?.overs_limit || 0) * 6;
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
  const currentBattingTeamId = isTeamABatting ? teamAId : teamBId;

  const battingSquad: Player[] = isTeamABatting ? teamAPlayers : teamBPlayers;
  const bowlingSquad: Player[] = isTeamABatting ? teamBPlayers : teamAPlayers;
  const isSoloBattingActive =
    matchData?.allow_solo_batting && currentWickets >= maxWickets - 1;

  const commonPlayerIds = teamAPlayers
    .filter((a) => teamBPlayers.some((b) => String(b.id) === String(a.id)))
    .map((p) => p.id);
  const wicketsRemaining = maxWickets - currentWickets;

  const getPlayerCurrentInningsStats = (playerId: string) => {
    const allEntries = scorecard.filter(
      (s: ScorecardItem) => String(s.player_id) === String(playerId),
    );
    if (allEntries.length === 0) return null;
    const exactMatch = allEntries.find(
      (s: ScorecardItem) =>
        (s.innings_id &&
          String(s.innings_id) === String(liveStats?.innings_id)) ||
        (s.batting_team_id &&
          String(s.batting_team_id) === String(currentBattingTeamId)) ||
        (s.team_id && String(s.team_id) === String(currentBattingTeamId)),
    );
    if (exactMatch) return exactMatch;
    if (commonPlayerIds.includes(playerId)) {
      return isSecondInnings
        ? allEntries.length > 1
          ? allEntries[1]
          : null
        : allEntries[0];
    }
    return allEntries[0];
  };

  const batterOptions = battingSquad
    .filter((p) => getPlayerCurrentInningsStats(p.id)?.is_out !== true)
    .map((p) => ({ id: p.id, name: p.name }));
  const bowlerOptions = bowlingSquad
    .filter((p) => String(p.id) !== String(previousBowlerId))
    .filter(
      (p) =>
        String(p.id) !== String(activeStriker?.id) &&
        String(p.id) !== String(activeNonStriker?.id),
    )
    .filter((p) => {
      if (commonPlayerIds.includes(p.id) && wicketsRemaining <= 2) {
        const stats = getPlayerCurrentInningsStats(p.id);
        if (!stats || (stats.balls_played === 0 && stats.runs_scored === 0))
          return false;
      }
      return true;
    })
    .map((p) => ({ id: p.id, name: p.name }));

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
        res.data?.data ||
        res.data?.innings_id ||
        res.data?.id ||
        "active-innings";
      setLiveStats(
        (prev) =>
          ({
            ...(prev || {}),
            innings_id: newInningsId,
            innings_no: currentInningsNo,
            batting_team_id: payload.batting_team_id,
            bowling_team_id: payload.bowling_team_id,
            legal_balls: 0,
            current_score: 0,
            wickets: 0,
            partnership_runs: 0,
            partnership_balls: 0,
          }) as LiveStats,
      );
    } catch (error) {
      toast.error("Failed to start innings");
    }
  };

  const handleUndo = async () => {
    if (!liveStats || isCooldown || !matchId) return;
    setIsCooldown(true);
    try {
      await api.post(`/scoring/undo/${matchId}`, {});

      setIsInningsDeclared(false);
      await refetchLiveStats();
      await queryClient.invalidateQueries({ queryKey: ["scorecard", matchId] });
      await queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      setHasSynced(false);
      toast.success("Last ball undone!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to undo ball.");
    } finally {
      setTimeout(() => setIsCooldown(false), 500);
    }
  };

  const handleBall = (runs: number, isWicket: boolean = false) => {
    if (!hasInningsStarted) return toast.error("Innings has not started yet!");
    if (isCurrentInningsOver)
      return toast.error("The innings is already over!");
    if (
      !activeStriker ||
      (!isSoloBattingActive && !activeNonStriker) ||
      !activeBowler
    )
      return toast.error("Please assign active players first!", {
        duration: 2000,
      });

    if (isWicket) {
      setShowWicketForm(true);
      return;
    }
    executeBallApi(runs, false, undefined, undefined, undefined);
  };

  const handleWicketSubmit = (
    wicketType: string,
    outBatterRole: "striker" | "non_striker",
    fielderId: string | null,
    runsCompleted: number,
  ) => {
    const exactOutPlayerId =
      outBatterRole === "striker" ? activeStriker?.id : activeNonStriker?.id;
    executeBallApi(
      runsCompleted,
      true,
      wicketType,
      exactOutPlayerId || undefined,
      fielderId || undefined,
    );
    setShowWicketForm(false);
  };

  const executeBallApi = async (
    runs: number,
    isWicket: boolean,
    wicketType?: string,
    outPlayerId?: string,
    fielderId?: string,
  ) => {
    if (!liveStats || !matchId) return;
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 1500);

    let isLegal = true,
      runsFromBat = runs,
      extras = 0,
      extraType: string | undefined = undefined;
    const newEvents: ("4" | "6" | "FREE_HIT" | "WICKET")[] = [];

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
      newEvents.push("FREE_HIT");
      setIsFreeHit(true);
    } else if (modifier === "BYE") {
      isLegal = true;
      runsFromBat = 0;
      extras = runs;
      extraType = "bye";
    } else if (modifier === "LB") {
      isLegal = true;
      runsFromBat = 0;
      extras = runs;
      extraType = "leg_bye";
    } else {
      if (isFreeHit) setIsFreeHit(false);
    }

    if (runsFromBat === 4) newEvents.push("4");
    if (runsFromBat === 6) newEvents.push("6");
    if (isWicket) newEvents.push("WICKET");

    if (newEvents.length > 0) setEventQueue((prev) => [...prev, ...newEvents]);

    const currentPartnershipRuns =
      (liveStats.partnership_runs || 0) + runsFromBat + extras;
    const currentPartnershipBalls =
      (liveStats.partnership_balls || 0) + (isLegal ? 1 : 0);

    const payload: BallPayload = {
      match_id: matchId,
      innings_id: liveStats.innings_id,
      over_number: overs,
      ball_number: ballsInOver + 1,
      striker_id: activeStriker?.id,
      non_striker_id: isSoloBattingActive ? undefined : activeNonStriker?.id,
      bowler_id: activeBowler?.id,
      is_legal_ball: isLegal,
      runs_from_bat: runsFromBat,
      extras: extras,
      is_wicket: isWicket,
      partnership_runs: isWicket ? 0 : currentPartnershipRuns,
      partnership_balls: isWicket ? 0 : currentPartnershipBalls,
    };

    if (extraType) payload.extra_type = extraType;
    if (wicketType) payload.wicket_type = wicketType;
    if (isWicket && outPlayerId) payload.out_player_id = outPlayerId;
    if (fielderId) payload.fielder_id = fielderId;

    try {
      await api.post("/scoring/ball", payload);
      setModifier(null);
      await refetchLiveStats();

      const isNowSoloBatting =
        matchData?.allow_solo_batting &&
        currentWickets + (isWicket ? 1 : 0) >= maxWickets - 1;
      let shouldSwapStrikers = runsFromBat % 2 !== 0;
      if (isLegal && ballsInOver === 5)
        shouldSwapStrikers = !shouldSwapStrikers;
      if (isNowSoloBatting) shouldSwapStrikers = false;

      let finalStrikerId = activeStriker?.id;
      let finalNonStrikerId = activeNonStriker?.id;

      if (shouldSwapStrikers && !isNowSoloBatting) {
        finalStrikerId = activeNonStriker?.id;
        finalNonStrikerId = activeStriker?.id;
      }
      if (isWicket && outPlayerId) {
        if (finalStrikerId === outPlayerId) finalStrikerId = undefined;
        if (finalNonStrikerId === outPlayerId) finalNonStrikerId = undefined;
      }
      if (isNowSoloBatting) {
        if (!finalStrikerId && finalNonStrikerId) {
          finalStrikerId = finalNonStrikerId;
        }
        finalNonStrikerId = undefined;
      }

      setActiveStriker(
        battingSquad.find((p) => p.id === finalStrikerId) || null,
      );
      setActiveNonStriker(
        battingSquad.find((p) => p.id === finalNonStrikerId) || null,
      );

      if (isLegal && ballsInOver === 5) {
        setPreviousBowlerId(activeBowler!.id);
        setActiveBowler(null);
      }
    } catch (error) {
      toast.error("Failed to record ball");
    }
  };

  const confirmDeclare = async () => {
    if (!liveStats) return;
    setIsDeclareModalOpen(false);
    setIsInningsDeclared(true);
    try {
      await api.post(`/scoring/innings/${liveStats.innings_id}/complete`);
      refetchLiveStats();
    } catch (error) {
      toast.error("Failed to complete innings.");
    }
  };

  const handleFinalizeMatch = async () => {
    try {
      await api.post(`/scoring/match/${matchId}/complete`);
      navigate(`/match/${matchId}`);
    } catch (error) {
      toast.error("Failed to complete match.");
    }
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
        onComplete={() => setEventQueue((prev) => prev.slice(1))}
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
        // We compare the current batting ID to Team A. If it matches, use Team A's name. Otherwise, Team B.
        battingTeam={
          liveStats?.batting_team_id === matchData?.team_a_id
            ? matchData?.team_a_name
            : matchData?.team_b_name || "TBA"
        }
        score={liveStats?.current_score || 0}
        wickets={liveStats?.wickets || 0}
        overs={oversDisplay}
        target={liveStats?.target_runs || 0}
        oversLimit={matchData?.overs_limit || 0}
        legalBalls={liveStats?.legal_balls || 0}
      />

      <div className="px-4 mt-4 space-y-4">
        {!isCurrentInningsOver &&
        matchData.status !== "completed" &&
        hasInningsStarted ? (
          <>
            {showPlayerSelection && (
              <div className="mb-4 bg-card p-3.5 rounded-2xl border border-border shadow-sm animate-fade-in text-left">
                <div className="flex justify-between items-center mb-3 px-1">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Active Players
                  </div>
                  {isSoloBattingActive && (
                    <div className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-black uppercase tracking-wider">
                      Solo Batting
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`min-w-0 ${isSoloBattingActive ? "col-span-2" : ""}`}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1">
                      Striker
                    </div>
                    <CustomDropdown
                      placeholder="Select..."
                      value={activeStriker?.id || ""}
                      options={batterOptions.filter(
                        (o) => o.id !== activeNonStriker?.id,
                      )}
                      onChange={(val) =>
                        setActiveStriker(
                          battingSquad.find((p) => p.id === val) || null,
                        )
                      }
                    />
                  </div>
                  {!isSoloBattingActive && (
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1 truncate">
                        Non-Striker
                      </div>
                      <CustomDropdown
                        placeholder="Select..."
                        value={activeNonStriker?.id || ""}
                        options={batterOptions.filter(
                          (o) => o.id !== activeStriker?.id,
                        )}
                        onChange={(val) =>
                          setActiveNonStriker(
                            battingSquad.find((p) => p.id === val) || null,
                          )
                        }
                      />
                    </div>
                  )}
                  <div className="col-span-2 min-w-0">
                    <div className="text-[10px] text-destructive/80 uppercase tracking-wider mb-1 px-1">
                      Bowler
                    </div>
                    <CustomDropdown
                      placeholder="Select Bowler..."
                      value={activeBowler?.id || ""}
                      options={bowlerOptions}
                      onChange={(val) =>
                        setActiveBowler(
                          bowlingSquad.find((p) => p.id === val) || null,
                        )
                      }
                    />
                  </div>
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
                isSoloBattingActive
                  ? "Solo Batting"
                  : activeNonStriker?.name ||
                    liveStats?.non_striker_name ||
                    "Pick Non-Striker"
              }
              nonStrikerRuns={
                isSoloBattingActive
                  ? 0
                  : getBatterStats(activeNonStriker?.id).runs
              }
              nonStrikerBalls={
                isSoloBattingActive
                  ? 0
                  : getBatterStats(activeNonStriker?.id).balls
              }
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

            <OverTimeline recentBalls={liveStats?.recent_balls || []} />

            {canUpdateScore ? (
              <div className="mt-6 animate-fade-in">
                {showWicketForm ? (
                  <WicketForm
                    availableFielders={bowlingSquad.filter(
                      (p) =>
                        String(p.id) !== String(activeStriker?.id) &&
                        String(p.id) !== String(activeNonStriker?.id),
                    )}
                    onSubmit={handleWicketSubmit}
                    onCancel={() => setShowWicketForm(false)}
                    isSoloBattingActive={isSoloBattingActive}
                    modifier={modifier}
                    isFreeHit={isFreeHit}
                  />
                ) : showRetireForm ? (
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-lg animate-fade-in text-center">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center justify-center gap-2 mb-4">
                      <UserX className="w-5 h-5 text-muted-foreground" /> Retire
                      Batter
                    </h3>
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => {
                          setActiveStriker(null);
                          setShowRetireForm(false);
                        }}
                        className="flex-1 py-4 rounded-xl bg-primary/10 text-primary border border-primary/30 font-bold uppercase tracking-wider text-xs active:scale-95 transition-transform hover:bg-primary/20"
                      >
                        Striker
                      </button>
                      {!isSoloBattingActive && (
                        <button
                          onClick={() => {
                            setActiveNonStriker(null);
                            setShowRetireForm(false);
                          }}
                          className="flex-1 py-4 rounded-xl bg-primary/10 text-primary border border-primary/30 font-bold uppercase tracking-wider text-xs active:scale-95 transition-transform hover:bg-primary/20"
                        >
                          Non-Striker
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowRetireForm(false)}
                      className="w-full py-3 rounded-xl bg-background border border-border text-muted-foreground font-bold uppercase tracking-wider text-xs active:scale-95 transition-transform hover:bg-border/50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <ScoringPad
                    onScore={handleBall}
                    modifier={modifier}
                    setModifier={setModifier}
                    isFreeHit={isFreeHit}
                    onComplete={() => setIsDeclareModalOpen(true)}
                    onRetire={() => setShowRetireForm(true)}
                    onUndo={handleUndo}
                    isCooldown={isCooldown}
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
          <div className="mt-6 animate-fade-in">
            {!hasInningsStarted && matchData.status !== "completed" ? (
              <div className="bg-card p-6 rounded-3xl border border-border shadow-lg text-center flex items-center justify-center min-h-50">
                <button
                  onClick={handleStartInnings}
                  className="w-full bg-primary hover:bg-primary/90 text-background font-black text-xl py-6 rounded-2xl shadow-md transition-transform active:scale-95"
                >
                  START 1ST INNINGS
                </button>
              </div>
            ) : matchData.status === "completed" ? (
              <div className="bg-card p-8 rounded-3xl border-2 border-primary/30 text-center shadow-xl flex flex-col items-center justify-center min-h-50">
                <h2 className="text-3xl font-black text-primary mb-3 uppercase tracking-widest">
                  Match Over
                </h2>
                <p className="text-muted-foreground font-medium mb-6">
                  This match has been finalized and stats are saved.
                </p>
                {canUpdateScore && (
                  <button
                    onClick={handleUndo}
                    disabled={isCooldown}
                    className="bg-background border border-border text-muted-foreground hover:text-foreground py-4 px-8 rounded-2xl font-bold text-sm w-full shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    <RotateCcw className="w-4 h-4" /> UNDO LAST BALL
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-3xl border-2 border-warning/50 text-center shadow-xl flex flex-col items-center justify-center min-h-50">
                <h2 className="text-3xl font-black text-warning mb-2 uppercase tracking-widest">
                  Innings Break
                </h2>
                <p className="text-muted-foreground mb-8 font-medium">
                  Players are resting. Click below when ready to resume.
                </p>
                {canUpdateScore && (
                  <div className="flex flex-col gap-3 w-full">
                    {!isSecondInnings ? (
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
                    )}
                    <button
                      onClick={handleUndo}
                      disabled={isCooldown}
                      className="bg-background border border-border text-muted-foreground hover:text-foreground py-4 px-8 rounded-2xl font-bold text-sm w-full shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      <RotateCcw className="w-4 h-4" /> UNDO LAST BALL
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScoring;
