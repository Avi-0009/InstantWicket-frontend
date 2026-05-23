import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "../Api/Auth";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
import ScoringPad from "../components/scoring/ScoringPad";

const LiveScoring = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // --- Metadata State (From Backend) ---
  const [matchData, setMatchData] = useState<any>(null);
  const [battingTeam, setBattingTeam] = useState("");
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [bowler, setBowler] = useState("");

  // --- Scoring State (From LocalStorage) ---
  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [totalBalls, setTotalBalls] = useState(0);
  const [thisOver, setThisOver] = useState<string[]>([]);

  const [modifier, setModifier] = useState<"WD" | "NB" | null>(null);
  const [isFreeHit, setIsFreeHit] = useState(false);

  // 1. Fetch Real Match Metadata (Teams, Auth)
  useEffect(() => {
    const fetchMatchInfo = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        const match = res.data.match || res.data;
        setMatchData(match);

        setBattingTeam(match.team_a_name || "");
        setStriker("Player 1"); // Wire to players later
        setNonStriker("Player 2");
        setBowler("Current Bowler");
      } catch (error) {
        console.error("Failed to load match metadata:", error);
      }
    };
    if (matchId) fetchMatchInfo();
  }, [matchId]);

  // 2. Load Score from LocalStorage on mount
  useEffect(() => {
    if (!matchId) return;
    const saved = localStorage.getItem(`match_score_${matchId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setScore(parsed.score || 0);
      setWickets(parsed.wickets || 0);
      setTotalBalls(parsed.totalBalls || 0);
      setThisOver(parsed.thisOver || []);
      setIsFreeHit(parsed.isFreeHit || false);
    }
  }, [matchId]);

  // 3. Save Score to LocalStorage on every change
  useEffect(() => {
    if (!matchId || !matchData) return; // Wait for initial load
    const dataToSave = { score, wickets, totalBalls, thisOver, isFreeHit };
    localStorage.setItem(`match_score_${matchId}`, JSON.stringify(dataToSave));
  }, [score, wickets, totalBalls, thisOver, isFreeHit, matchId, matchData]);

  // 4. Core Scoring Engine
  const handleBall = (runs: number, isWicket: boolean = false) => {
    let isLegal = true;
    let ballLabel = isWicket ? "W" : runs.toString();
    let runsToAdd = runs;

    if (modifier === "WD") {
      isLegal = false;
      runsToAdd += 1;
      ballLabel = runs > 0 ? `${runs}Wd` : "Wd";
    }
    if (modifier === "NB") {
      isLegal = false;
      runsToAdd += 1;
      ballLabel = runs > 0 ? `${runs}Nb` : "Nb";
      setIsFreeHit(true);
    }
    if (isWicket && modifier) ballLabel = `${modifier}+W`;

    setScore((prev) => prev + runsToAdd);
    if (isWicket) setWickets((prev) => prev + 1);

    const newOver = [...thisOver, ballLabel];
    setThisOver(newOver);

    if (isLegal) {
      setTotalBalls((prev) => prev + 1);
      if (isFreeHit) setIsFreeHit(false);

      const legalBallsThisOver = newOver.filter(
        (b) => !b.includes("Wd") && !b.includes("Nb"),
      ).length;
      if (legalBallsThisOver === 6) {
        setTimeout(() => setThisOver([]), 1500);
      }
    }
    setModifier(null);
  };

  if (!matchData)
    return (
      <div className="text-foreground p-8 text-center animate-pulse">
        Loading match...
      </div>
    );

  const isHost = user?.id && user.id === matchData.created_by;
  const isUmpire = user?.id && user.id === matchData.umpire_id;
  const canUpdateScore = isHost || isUmpire;
  const oversDisplay = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Live Match</h1>
        </div>
      </div>

      <ScoreHeader
        battingTeam={battingTeam}
        score={score}
        wickets={wickets}
        overs={oversDisplay}
      />

      <div className="px-4 mt-4 space-y-4">
        <PlayerStats
          striker={striker}
          nonStriker={nonStriker}
          bowler={bowler}
        />
        <OverTimeline thisOver={thisOver} />

        {canUpdateScore ? (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-2 px-1">
              Update Score (Admin)
            </h3>
            <ScoringPad
              onScore={handleBall}
              modifier={modifier}
              setModifier={setModifier}
              isFreeHit={isFreeHit}
            />
          </div>
        ) : (
          <div className="mt-8 p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center shadow-lg animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-foreground font-bold mb-1">Read-Only View</h3>
            <p className="text-sm text-muted-foreground">
              You are viewing this match as a spectator. Only the host and
              umpire can update the score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScoring;
