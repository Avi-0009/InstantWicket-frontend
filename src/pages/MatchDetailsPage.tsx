import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { api } from "../Api/Auth";

export default function MatchDetailsPage() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    const fetchRealMatchData = async () => {
      // 1. Fetch Static Match Info (This will ALWAYS work)
      try {
        const matchRes = await api.get(`/matches/${matchId}`);
        setMatchData(matchRes.data.match || matchRes.data);
      } catch (error) {
        console.error("Failed to fetch match details", error);
      }

      // 2. Fetch Live Scoreboard (This MIGHT fail if the match hasn't started)
      try {
        const liveRes = await api.get(`/scoring/live/${matchId}`);
        if (liveRes.data && Object.keys(liveRes.data).length > 0) {
          setLiveStats(liveRes.data);
        }
      } catch (error) {
        // We just silently ignore this error because it simply means
        // the umpire hasn't clicked "Start 1st Innings" yet!
        console.log("No live stats yet. Match likely hasn't started.");
      }
    };

    fetchRealMatchData(); // Initial load
    const interval = setInterval(fetchRealMatchData, 3000); // 3-second polling
    return () => clearInterval(interval);
  }, [matchId]);

  if (!matchData) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center animate-pulse">
        Loading live match...
      </div>
    );
  }

  const overs = liveStats ? Math.floor((liveStats.legal_balls || 0) / 6) : 0;
  const balls = liveStats ? (liveStats.legal_balls || 0) % 6 : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Match Details</h1>
      </div>

      {/* Main Scorecard */}
      <div className="bg-[#0B1F1B] border border-[#1B3530] p-6 rounded-2xl shadow-lg text-center">
        <h2 className="text-xl font-bold text-primary mb-2">
          {matchData.team_a_name}{" "}
          <span className="text-muted-foreground text-sm mx-2">vs</span>{" "}
          {matchData.team_b_name}
        </h2>

        {liveStats?.innings_id ? (
          <div className="mt-4 animate-fade-in">
            <div className="text-5xl font-black text-[#F4FFFD] tracking-tight drop-shadow-md">
              {liveStats.current_score}{" "}
              <span className="text-2xl text-muted-foreground">
                / {liveStats.wickets}
              </span>
            </div>
            <div className="text-[#9FB7B2] font-semibold mt-1">
              Overs:{" "}
              <span className="text-primary">
                {overs}.{balls}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#0D2420] p-3 rounded-xl border border-[#1B3530]/50">
                <div className="text-xs text-[#9FB7B2] uppercase mb-1">
                  Striker
                </div>
                <div className="font-bold text-[#F4FFFD]">
                  {liveStats.striker_name || "N/A"}
                </div>
                <div className="text-primary text-sm">
                  {liveStats.striker_runs || 0} ({liveStats.striker_balls || 0})
                </div>
              </div>
              <div className="bg-[#0D2420] p-3 rounded-xl border border-[#1B3530]/50">
                <div className="text-xs text-[#9FB7B2] uppercase mb-1">
                  Non-Striker
                </div>
                <div className="font-bold text-[#F4FFFD]">
                  {liveStats.non_striker_name || "N/A"}
                </div>
                <div className="text-primary text-sm">
                  {liveStats.non_striker_runs || 0} (
                  {liveStats.non_striker_balls || 0})
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-muted-foreground font-medium py-8 border-t border-[#1B3530]/50">
            The toss has not occurred or innings has not started yet.
          </div>
        )}
      </div>
    </div>
  );
}
