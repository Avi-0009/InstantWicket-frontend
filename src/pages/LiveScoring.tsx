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
  const [battingSquad, setBattingSquad] = useState<Player[]>([]);
  const [bowlingSquad, setBowlingSquad] = useState<Player[]>([]);

  // 🔴 DEBUG STATE - Allows you to see exactly what Go is sending
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

  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [showWicketForm, setShowWicketForm] = useState(false);
  const [pendingRuns, setPendingRuns] = useState(0);

  const fetchLiveScoreboard = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await api.get(`/scoring/live/${matchId}`);
      setLiveStats(res.data);
    } catch (error: any) {
      console.error("Live Scoreboard Error (Line 52):", error);
      // Fails silently if match hasn't started, this is normal.
    }
  }, [matchId]);

  useEffect(() => {
    const fetchMatchInfo = async () => {
      try {
        const matchRes = await api.get(`/matches/${matchId}`);
        const match = matchRes.data.match || matchRes.data;
        setMatchData(match);

        // 🔴 FETCHING PLAYERS
        try {
          const playersRes = await api.get(`/matches/${matchId}/players`);
          const allPlayers = playersRes.data.players || [];

          // Set debug log so you can physically see the JSON
          setDebugLog(JSON.stringify(allPlayers, null, 2));

          if (allPlayers.length === 0) {
            toast.error("Backend sent 0 players! Check CreateMatch function.", {
              duration: 4000,
            });
          }

          const playersA = allPlayers.filter(
            (p: any) => p.team_id === match.team_a_id,
          );
          const playersB = allPlayers.filter(
            (p: any) => p.team_id === match.team_b_id,
          );

          let isTeamABatting = true;
          if (match.toss_decision === "bat") {
            isTeamABatting = match.toss_winner_team_id === match.team_a_id;
          } else if (match.toss_decision === "bowl") {
            isTeamABatting = match.toss_winner_team_id !== match.team_a_id;
          }

          if (isTeamABatting) {
            setBattingSquad(playersA);
            setBowlingSquad(playersB);
          } else {
            setBattingSquad(playersB);
            setBowlingSquad(playersA);
          }
        } catch (playerErr: any) {
          setDebugLog(`API FAILED: ${playerErr.message}`);
          toast.error("Failed to fetch players. Is the route added in Go?");
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

  const overs = liveStats ? Math.floor(liveStats.legal_balls / 6) : 0;
  const ballsInOver = liveStats ? liveStats.legal_balls % 6 : 0;
  const oversDisplay = Number(`${overs}.${ballsInOver}`);

  const getPlayerName = (id: string, role: "batter" | "bowler") => {
    if (!id) return null;
    const squad = role === "batter" ? battingSquad : bowlingSquad;
    const player = squad.find((p) => p.id === id);
    return player ? player.name : null;
  };

  const displayStriker =
    activeStriker?.name ||
    getPlayerName(liveStats?.striker_id, "batter") ||
    liveStats?.striker_name ||
    "Select Striker";
  const displayNonStriker =
    activeNonStriker?.name ||
    getPlayerName(liveStats?.non_striker_id, "batter") ||
    liveStats?.non_striker_name ||
    "Select Non-Striker";
  const displayBowler =
    activeBowler?.name ||
    getPlayerName(liveStats?.bowler_id, "bowler") ||
    liveStats?.bowler_name ||
    "Select Bowler";

  // --- Start Innings Logic ---
  const handleStartInnings = async () => {
    if (!activeStriker || !activeNonStriker || !activeBowler) {
      toast.error("Please assign a Striker, Non-Striker, and Bowler first!", {
        duration: 2000,
      });
      return;
    }

    const isTeamABatting =
      matchData.toss_decision === "bat"
        ? matchData.toss_winner_team_id === matchData.team_a_id
        : matchData.toss_winner_team_id === matchData.team_b_id;

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
      innings_no: 1,
      target_runs: null,
    };

    const loadingToast = toast.loading("Starting Innings...");
    try {
      await api.post("/scoring/start", payload);
      toast.success("Innings Started!", { id: loadingToast, duration: 1500 });
      fetchLiveScoreboard();
    } catch (error) {
      toast.error("Failed to start innings", {
        id: loadingToast,
        duration: 1500,
      });
    }
  };

  // --- Core Scoring Logic ---
  const handleBall = (runs: number, isWicket: boolean = false) => {
    if (!liveStats?.innings_id)
      return toast.error("Innings has not been started yet!", {
        duration: 1500,
      });
    if (isWicket) {
      setPendingRuns(runs);
      setShowWicketForm(true);
      return;
    }
    executeBallApi(runs, false, null, null);
  };

  const handleWicketSubmit = (wicketType: string, fielderId: string | null) => {
    executeBallApi(pendingRuns, true, wicketType, fielderId);
    setShowWicketForm(false);
  };

  const executeBallApi = async (
    runs: number,
    isWicket: boolean,
    wicketType: string | null,
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

    const payload = {
      innings_id: liveStats.innings_id,
      over_number: overs,
      ball_number: ballsInOver + 1,
      striker_id: activeStriker?.id || liveStats.striker_id,
      non_striker_id: activeNonStriker?.id || liveStats.non_striker_id,
      bowler_id: activeBowler?.id || liveStats.bowler_id,
      is_legal_ball: isLegal,
      runs_from_bat: runsFromBat,
      extras: extras,
      extra_type: extraType,
      is_wicket: isWicket,
      wicket_type: wicketType,
      out_player_id: isWicket
        ? activeStriker?.id || liveStats.striker_id
        : null,
      fielder_id: fielderId,
    };

    const loadingToast = toast.loading("Recording ball...");
    try {
      await api.post("/scoring/ball", payload);
      toast.success(isWicket ? "Wicket recorded!" : "Ball recorded", {
        id: loadingToast,
        duration: 1000,
      });
      setModifier(null);
      fetchLiveScoreboard();
    } catch (error) {
      toast.error("Failed to record ball", {
        id: loadingToast,
        duration: 1500,
      });
    }
  };

  const confirmDeclare = async () => {
    setIsDeclareModalOpen(false);
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
        {/* Buttons to assign players */}
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
          ].filter(Boolean) as string[]
        }
        onSelect={handlePlayerSelect}
        onClose={() => setModalConfig({ isOpen: false, role: null })}
      />

      {/* 🔴 DEBUG PANEL - REMOVE ONCE YOU CONFIRM DATA IS LOADING */}
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
