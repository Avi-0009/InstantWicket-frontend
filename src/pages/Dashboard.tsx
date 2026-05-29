import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
import LiveMatchCard from "../components/matches/LiveMatchCard";
import { Trophy, Activity, TrendingUp, Zap, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../Api/Auth";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

let hasSeenSplashThisSession = false;

const Dashboard = () => {
  const { user } = useAuthStore(); // Retrieve the logged-in user
  const [isLoading, setIsLoading] = useState(!hasSeenSplashThisSession);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  // REAL DATA STATE
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!hasSeenSplashThisSession) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        hasSeenSplashThisSession = true;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // FETCH & STRICTLY FILTER MATCHES
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return; // Do not fetch if the user isn't loaded

      setIsFetchingPage(true);
      try {
        // Pass query params to tell the backend what to look for using the strict TypeScript property
        const res = await api.get(
          `/matches?page=${page}&limit=10&status=ongoing&user_id=${user.id}`,
        );
        const rawMatches = res.data.matches || res.data || [];

        // 🛡️ FRONTEND SAFETY FILTER
        // Strictly guarantee only ONGOING matches where the user is creator or umpire are shown
        const strictlyFilteredMatches = rawMatches.filter((m: any) => {
          const isOngoing = m.status === "ongoing";
          const isMine = m.created_by === user.id || m.umpire_id === user.id;
          return isOngoing && isMine;
        });

        // Check if the backend has run out of matches
        if (rawMatches.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Apply pagination append logic
        setMatches((prev) =>
          page === 1
            ? strictlyFilteredMatches
            : [...prev, ...strictlyFilteredMatches],
        );
      } catch (error) {
        console.error("Failed to fetch matches:", error);
        toast.error("Failed to fetch dashboard matches!");
      } finally {
        setIsFetchingPage(false);
      }
    };

    fetchMatches();
  }, [page, user]);

  if (isLoading) return <SplashScreen />;

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 max-w-6xl mx-auto pb-24 transition-colors duration-200"
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-foreground">
            InstantWicket
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name || "Umpire"}! Here is your active console.
          </p>
        </div>

        <NavLink
          to="/new-match"
          className="bg-primary text-white border-none rounded-lg px-6 py-3 text-sm font-bold flex items-center gap-2 w-full md:w-auto justify-center hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)]"
        >
          <Trophy className="w-4 h-4" /> Start New Match
        </NavLink>
      </div>

      {/* Top Stats Grid (Simplified for Live Action) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <Activity className="w-5 h-5 text-destructive mb-2 animate-pulse" />
          <div className="text-3xl font-bold text-foreground">
            {matches.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            My Active Matches
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <div className="text-3xl font-bold text-foreground">0</div>
          <div className="text-xs text-muted-foreground mt-1">
            Runs Scored (Today)
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
          <Trophy className="w-5 h-5 text-warning mb-2" />
          <div className="text-3xl font-bold text-foreground">0</div>
          <div className="text-xs text-muted-foreground mt-1">
            Wickets Taken (Today)
          </div>
        </div>
      </div>

      {/* Title Area */}
      <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Zap className="w-5 h-5 text-primary" /> My Live Matches
        </h2>
      </div>

      {/* REAL Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {matches.length === 0 && !isFetchingPage ? (
          <div className="text-muted-foreground text-sm col-span-2 py-8 text-center bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-2">
            <Activity className="w-8 h-8 text-border mb-2" />
            <p className="font-semibold">You have no active matches.</p>
            <p className="text-xs">
              Start a new match to see it here, or check the Matches tab for
              history.
            </p>
          </div>
        ) : (
          matches.map((match) => <LiveMatchCard key={match.id} match={match} />)
        )}
      </div>

      {/* PAGINATION: MANUAL LOAD MORE BUTTON */}
      {hasMore && matches.length > 0 && (
        <div className="flex justify-center mt-6 mb-12">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isFetchingPage}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full text-foreground hover:bg-card-hover hover:border-primary/50 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            {isFetchingPage ? "Loading..." : "Load More Matches"}
            {!isFetchingPage && <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </motion.main>
  );
};

export default Dashboard;
