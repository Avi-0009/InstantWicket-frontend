import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Activity,
  TrendingUp,
  UserCircle,
  ChevronRight,
  Zap,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { api } from "../Api/Auth";
import LiveMatchCard from "../components/matches/LiveMatchCard";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [matches, setMatches] = useState<any[]>([]);
  const [isFetchingMatches, setIsFetchingMatches] = useState(true);

  // 1. Fetch Actual Player Stats (Only if Logged In)
  // 1. Fetch Actual Player Stats (Only if Logged In)
  useEffect(() => {
    const fetchFullStats = async () => {
      if (!user?.id) {
        setIsLoadingStats(false);
        return;
      }
      try {
        // FIX 1: Change hyphen (-) to underscore (_) to match backend routing
        const res = await api.get(`/player_stats/${user.id}`);

        // FIX 2: Look for the exact key the backend returns ("player_stats")
        const fetchedData =
          res.data?.player_stats || res.data?.data || res.data;
        setStats(fetchedData);
      } catch (e: any) {
        // FIX 3: Gracefully handle the 404 if the user doesn't have stats yet
        if (e.response?.status === 404) {
          console.warn("No player stats found for this user yet (New User).");
          setStats(null); // Safely defaults to 0 in your UI
        } else {
          console.error("Failed to load full stats", e);
        }
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchFullStats();
  }, [user]);

  // 2. Fetch Live Matches (Global for Everyone)
  useEffect(() => {
    const fetchMatches = async () => {
      setIsFetchingMatches(true);
      try {
        const res = await api.get(`/matches?limit=50`);
        const rawMatches = res.data.matches || res.data || [];

        // Base Filter: Must be ONGOING
        const ongoingMatches = rawMatches.filter(
          (m: any) => m.status === "ongoing",
        );

        // LOGIC FIX: We now show all ongoing matches to EVERYONE,
        // regardless of whether they are a guest, player, host, or umpire.
        setMatches(ongoingMatches);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      } finally {
        setIsFetchingMatches(false);
      }
    };
    fetchMatches();
  }, [user]);

  const displayFullName = stats?.name || user?.name || "Player";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto pb-24"
    >
      {/* BRANDING HEADER (Visible to everyone) */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#0FAF9A] to-[#1B3530] bg-clip-text text-transparent drop-shadow-sm">
          InstantWicket
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#0FAF9A] animate-pulse" />
          <p className="text-foreground font-bold text-lg">
            {user ? `${displayFullName}'s Dashboard` : "Live Action Dashboard"}
          </p>
        </div>
      </div>

      {/* CONDITIONAL TOP SECTION: User Stats vs Guest Login */}
      {user ? (
        <>
          {/* CLICKABLE PROFILE PREVIEW */}
          <div
            onClick={() => navigate(`/player_stats/${user.id}`)}
            className="mb-8 flex items-center justify-between bg-card p-6 rounded-3xl border border-border cursor-pointer hover:border-primary/50 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCircle className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">
                  {displayFullName}
                </h2>
                <p className="text-sm text-primary font-medium">
                  Tap to view full career profile
                </p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {/* FETCHED STATS GRID */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <StatCard
              icon={<Trophy className="text-primary" />}
              label="Runs"
              value={
                isLoadingStats
                  ? "..."
                  : stats?.career_runs || stats?.runs_scored || 0
              }
            />
            <StatCard
              icon={<TrendingUp className="text-destructive" />}
              label="Wickets"
              value={
                isLoadingStats
                  ? "..."
                  : stats?.career_wickets || stats?.wickets_taken || 0
              }
            />
            <StatCard
              icon={<Activity className="text-[#0FAF9A]" />}
              label="Matches"
              value={
                isLoadingStats
                  ? "..."
                  : stats?.career_matches || stats?.matches_played || 0
              }
            />
          </div>
        </>
      ) : (
        /* GUEST CTA BANNER */
        <div className="bg-card border border-border p-8 rounded-3xl text-center shadow-sm mb-10 group hover:border-primary/40 transition-colors">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">
            Track Your Career
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Sign in to view your detailed player stats, manage your teams, and
            score your own live matches.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-primary text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-primary-hover transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <LogIn className="w-5 h-5" /> Sign In / Sign Up
          </button>
        </div>
      )}

      {/* LIVE MATCHES SECTION */}
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Zap className="w-5 h-5 text-primary animate-pulse" />
          {user ? "My Live Matches" : "Global Live Matches"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isFetchingMatches ? (
          <div className="text-muted-foreground text-sm col-span-2 py-8 text-center bg-card rounded-xl border border-border">
            Loading live matches...
          </div>
        ) : matches.length === 0 ? (
          <div className="text-muted-foreground text-sm col-span-2 py-8 text-center bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-2 shadow-sm">
            <Activity className="w-8 h-8 text-border mb-2" />
            <p className="font-semibold text-foreground">
              No active matches right now.
            </p>
            <p className="text-xs text-muted-foreground text-center px-4">
              {user
                ? "Start a new match or get assigned as an umpire to see it appear here live."
                : "Check back later to see live matches from across the platform."}
            </p>
          </div>
        ) : (
          matches.map((match) => <LiveMatchCard key={match.id} match={match} />)
        )}
      </div>
    </motion.main>
  );
};

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-2xl font-black text-foreground">{value}</div>
    </div>
  );
}

export default Dashboard;
