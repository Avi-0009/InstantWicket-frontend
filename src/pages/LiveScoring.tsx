import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

import ScoreHeader from "../components/scoring/ScoreHeader";
import PlayerStats from "../components/scoring/PlayerStats";
import OverTimeline from "../components/scoring/OverTimeline";
import ScoringPad from "../components/scoring/ScoringPad";

const LiveScoring = () => {
  const navigate = useNavigate();

  // 1. Get the current logged-in user
  const { user } = useAuthStore();

  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    // 2. LOGICAL FIX: Since we are mocking, we set the match creator to the current user's ID
    // so that the auth check below actually passes when you create a match!
    setMatchData({
      id: "match-123",
      created_by: user?.id || "guest", // Now it matches YOU!
      umpire_id: "some-umpire-id-here",
      status: "ongoing",
    });
  }, [user]);

  if (!matchData)
    return (
      <div className="text-foreground p-8 text-center">Loading match...</div>
    );

  // 3. The Authorization Check Logic
  const isHost = user?.id && user.id === matchData.created_by;
  const isUmpire = user?.id && user.id === matchData.umpire_id;
  const canUpdateScore = isHost || isUmpire;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Top Header with Back Button */}
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

      {/* Everyone sees the Scoreboard */}
      <ScoreHeader />
      <div className="px-4 mt-4 space-y-4">
        <PlayerStats />
        <OverTimeline />

        {/* 4. Conditional Rendering based on Role Logic */}
        {canUpdateScore ? (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">
              Update Score (Admin)
            </h3>
            {/* Your update buttons show up here! */}
            <ScoringPad />
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
