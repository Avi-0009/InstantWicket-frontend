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
import { useQuery } from "@tanstack/react-query";

// --- STRICT TYPESCRIPT INTERFACES ---
interface PlayerStats {
  name?: string;
  career_runs?: number;
  runs_scored?: number;
  career_wickets?: number;
  wickets_taken?: number;
  career_matches?: number;
  matches_played?: number;
}

interface Match {
  id: string;
  status: string;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  team_a_wickets: number;
  team_b_wickets: number;
  team_a_balls: number;
  team_b_balls: number;
  overs_limit: number;
  host_id?: string;
  user_id?: string;
  umpire_id?: string;
  [key: string]: unknown;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 1. Fetch Actual Player Stats (Only if Logged In)
  const { data: stats, isLoading: isLoadingStats } =
    useQuery<PlayerStats | null>({
      queryKey: ["playerStats", user?.id],
      queryFn: async () => {
        try {
          const res = await api.get(`/player_stats/${user?.id}`);
          return (res.data?.player_stats ||
            res.data?.data ||
            res.data) as PlayerStats;
        } catch (e: unknown) {
          const error = e as { response?: { status?: number } };
          if (error.response?.status === 404) {
            console.warn("No player stats found for this user yet (New User).");
            return null;
          }
          throw e;
        }
      },
      enabled: !!user?.id,
      refetchInterval: 15000,
    });

  // 2. Fetch Live Matches (Global for Everyone)
  const { data: matches = [], isLoading: isFetchingMatches } = useQuery<
    Match[]
  >({
    queryKey: ["globalLiveMatches"],
    queryFn: async () => {
      const res = await api.get(`/matches?limit=50`);
      const rawMatches = (res.data.matches || res.data || []) as Match[];

      return rawMatches.filter((m) => m.status === "ongoing");
    },
    refetchInterval: 5000,
  });

  const displayFullName = stats?.name || user?.name || "Player";

  // 🔥 3. SEPARATE MATCHES LOGIC
  // My Matches: Only show if the user is the HOST or the UMPIRE
  const myMatches = matches.filter(
    (match) =>
      user && (match.host_id === user.id || match.umpire_id === user.id),
  );

  // Global Matches: Show top 3 matches where the user is NOT the host and NOT the umpire
  const globalMatches = matches
    .filter(
      (match) =>
        !user || (match.host_id !== user.id && match.umpire_id !== user.id),
    )
    .slice(0, 3);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto pb-24"
    >
      {/* BRANDING HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black bg-linear-to-r from-primary bg-clip-text text-transparent drop-shadow-sm">
          InstantWicket
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-foreground font-bold text-lg">
            {user ? `${displayFullName}'s Dashboard` : "Live Action Dashboard"}
          </p>
        </div>
      </div>

      {/* CONDITIONAL TOP SECTION */}
      {user ? (
        <>
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
              icon={<Activity className="text-primary" />}
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

      {/* ========================================================= */}
      {/* MY LIVE MATCHES (Logged-in users only) */}
      {/* ========================================================= */}
      {user && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              My Live Matches
            </h2>
          </div>

          {isFetchingMatches ? (
            <div className="text-muted-foreground text-sm py-8 text-center bg-card rounded-xl border border-border">
              Loading your matches...
            </div>
          ) : myMatches.length === 0 ? (
            <div className="text-muted-foreground text-sm py-8 text-center bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-2 shadow-sm">
              <Activity className="w-8 h-8 text-border mb-2" />
              <p className="font-semibold text-foreground">
                No active matches for you right now.
              </p>
              <p className="text-xs text-muted-foreground text-center px-4">
                Start a new match or get assigned as an umpire to see it appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto no-scrollbar pr-1 pb-2">
              {myMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* GLOBAL LIVE MATCHES (Visible to everyone, max 3) */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-muted-foreground" />
            Global Live Matches
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isFetchingMatches ? (
            <div className="text-muted-foreground text-sm col-span-2 py-8 text-center bg-card rounded-xl border border-border">
              Loading live matches...
            </div>
          ) : globalMatches.length === 0 ? (
            <div className="text-muted-foreground text-sm col-span-2 py-8 text-center bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-2 shadow-sm">
              <Activity className="w-8 h-8 text-border mb-2" />
              <p className="font-semibold text-foreground">
                No active matches right now.
              </p>
              <p className="text-xs text-muted-foreground text-center px-4">
                Check back later to see live matches from across the platform.
              </p>
            </div>
          ) : (
            globalMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))
          )}
        </div>
      </div>
    </motion.main>
  );
};

function StatCard({ icon, label, value }: StatCardProps) {
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
