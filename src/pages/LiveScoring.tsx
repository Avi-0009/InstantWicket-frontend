import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, AlertOctagon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../Api/Auth";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
import ScoringPad from "../components/scoring/ScoringPad";
import {
  PlayerSelectModal,
  type Player,
} from "../components/scoring/PlayerSelectModal";
import { FullScreenEvent } from "../components/scoring/FullScreenEvent";

const LiveScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [matchData, setMatchData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);

  const [battingSquad, setBattingSquad] = useState<Player[]>([]);
  const [bowlingSquad, setBowlingSquad] = useState<Player[]>([]);

  const [modifier, setModifier] = useState<"WD" | "NB" | null>(null);
  const [isFreeHit, setIsFreeHit] = useState(false);

  // NEW: State for Full Screen Animations
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

  const fetchLiveScoreboard = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await api.get(`/scoring/live/${matchId}`);
      setLiveStats(res.data);
    } catch (error) {
      console.error("Failed to load live stats:", error);
    }
  }, [matchId]);

  useEffect(() => {
    const fetchMatchInfo = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        const match = res.data.match || res.data;
        setMatchData(match);

        const teamARes = await api.get(`/teams/${match.team_a_id}`);
        const teamBRes = await api.get(`/teams/${match.team_b_id}`);

        setBattingSquad(teamARes.data.players || []);
        setBowlingSquad(teamBRes.data.players || []);
      } catch (error) {
        console.error("Failed to load match metadata:", error);
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

  const teamSize = battingSquad.length || 11;
  const maxWickets = matchData?.allow_solo_batting ? teamSize : teamSize - 1;

  const isOverComplete = ballsInOver === 0 && liveStats?.legal_balls > 0;
  const isInningsComplete =
    (matchData && overs >= matchData.overs_limit) ||
    (liveStats && liveStats.wickets >= maxWickets);

  useEffect(() => {
    if (!liveStats || isInningsComplete) return;
    if (isOverComplete) {
      setModalConfig({ isOpen: true, role: "Bowler" });
      const temp = activeStriker;
      setActiveStriker(activeNonStriker);
      setActiveNonStriker(temp);
    }
  }, [liveStats, isOverComplete, isInningsComplete]);

  const handleBall = async (runs: number, isWicket: boolean = false) => {
    if (!liveStats?.innings_id)
      return alert("Innings has not been started yet!");

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
      setCurrentEvent("FREE_HIT"); // Trigger Free Hit Animation
      setIsFreeHit(true);
    } else {
      if (isFreeHit) setIsFreeHit(false);
    }

    // Trigger Animations for normal boundaries or wickets
    if (!modifier && runsFromBat === 4) setCurrentEvent("4");
    if (!modifier && runsFromBat === 6) setCurrentEvent("6");
    if (isWicket) setCurrentEvent("WICKET");

    let wicketType = null,
      outPlayerId = null,
      fielderId = null;
    if (isWicket) {
      const type = window.prompt(
        "Wicket Type? (bowled, caught, run_out, stumped)",
        "bowled",
      );
      if (!type) {
        setCurrentEvent(null);
        return;
      }
      wicketType = type;
      outPlayerId = activeStriker?.id || liveStats.striker_id;
    }

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
      out_player_id: outPlayerId,
      fielder_id: fielderId,
    };

    try {
      await api.post("/scoring/ball", payload);
      setModifier(null);
      fetchLiveScoreboard();
    } catch (error) {
      console.error("Failed to record ball", error);
    }
  };

  // NEW: Manual Early Completion
  const handleForceComplete = async () => {
    const confirmStr = `Are you sure you want to end this innings? \n\nFinal Score: ${liveStats?.current_score}/${liveStats?.wickets} \nActual Overs Played: ${oversDisplay}`;

    if (window.confirm(confirmStr)) {
      try {
        // Assume you have an API route to forcefully complete the innings and save exact overs played
        await api.post(`/scoring/innings/${liveStats.innings_id}/complete`, {
          final_overs: oversDisplay,
        });
        alert("Innings Successfully Completed.");
        fetchLiveScoreboard(); // Refresh will naturally lock the UI because backend will return status='completed'
        // navigate('/match-summary') or wherever you want them to go next
      } catch (error) {
        console.error("Failed to complete innings", error);
      }
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
      {/* Renders the Massive Animation Popup if currentEvent is active */}
      <FullScreenEvent
        eventType={currentEvent}
        onComplete={() => setCurrentEvent(null)}
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

        {/* Manual Complete Button in Header */}
        {canUpdateScore && !isInningsComplete && (
          <button
            onClick={handleForceComplete}
            className="flex items-center gap-2 text-xs font-bold bg-red-900/40 text-red-400 border border-red-900/50 px-3 py-1.5 rounded-lg hover:bg-red-900/60"
          >
            <AlertOctagon className="w-4 h-4" /> Declare / Complete
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
        <div
          onClick={() =>
            canUpdateScore && setModalConfig({ isOpen: true, role: "Striker" })
          }
        >
          <PlayerStats
            striker={
              activeStriker?.name || liveStats?.striker_name || "Select Striker"
            }
            nonStriker={
              activeNonStriker?.name ||
              liveStats?.non_striker_name ||
              "Select Non-Striker"
            }
            bowler={
              activeBowler?.name || liveStats?.bowler_name || "Select Bowler"
            }
          />
        </div>

        <OverTimeline thisOver={[]} />

        {canUpdateScore ? (
          isInningsComplete ? (
            <button className="w-full mt-6 bg-green-600 text-white font-bold text-xl py-6 rounded-xl shadow-lg animate-pulse">
              INNINGS COMPLETED
            </button>
          ) : (
            <div className="mt-6 animate-fade-in">
              <ScoringPad
                onScore={handleBall}
                modifier={modifier}
                setModifier={setModifier}
                isFreeHit={isFreeHit}
              />
            </div>
          )
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
        currentlyPlayingIds={[
          activeStriker?.id || liveStats?.striker_id,
          activeNonStriker?.id || liveStats?.non_striker_id,
          activeBowler?.id || liveStats?.bowler_id,
        ].filter(Boolean)}
        onSelect={handlePlayerSelect}
        onClose={() => setModalConfig({ isOpen: false, role: null })}
      />
    </div>
  );
};

export default LiveScoring;
