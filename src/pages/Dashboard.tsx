import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import SplashScreen from "../components/SplashScreen";
import LiveMatchCard from "../components/matches/LiveMatchCard";
import {
  Trophy,
  Activity,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../Api/Auth";
import toast from "react-hot-toast";

let hasSeenSplashThisSession = false;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(!hasSeenSplashThisSession);
  const [activeTab, setActiveTab] = useState("All");
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

  // FETCH REAL MATCHES WITH PAGINATION
  useEffect(() => {
    const fetchMatches = async () => {
      setIsFetchingPage(true);
      try {
        const res = await api.get(`/matches?page=${page}&limit=10`);
        const newMatches = res.data.matches || res.data || [];

        // If the backend returns less than 10 matches, we know there are no more pages
        if (newMatches.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // If it's page 1, set the matches. If it's page 2+, APPEND them to the existing list.
        setMatches((prev) =>
          page === 1 ? newMatches : [...prev, ...newMatches],
        );
      } catch (error) {
        console.error("Failed to fetch matches:", error);
        toast.error("Failed to fetch match list!");
      } finally {
        setIsFetchingPage(false);
      }
    };
    fetchMatches();
  }, [page]);

  if (isLoading) return <SplashScreen />;

  // Calculate real stats
  const liveMatchesCount = matches.filter((m) => m.status === "ongoing").length;

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
            Welcome! Here's what's happening today.
          </p>
        </div>

        <NavLink
          to="/new-match"
          className="bg-primary text-white border-none rounded-lg px-6 py-3 text-sm font-bold flex items-center gap-2 w-full md:w-auto justify-center hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)]"
        >
          <Trophy className="w-4 h-4" /> Start New Match
        </NavLink>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveTab("Recent")}
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
        >
          <Trophy className="w-5 h-5 text-warning mb-2" />
          <div className="text-3xl font-bold text-foreground">
            {matches.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Loaded</div>
        </div>
        <div
          onClick={() => setActiveTab("Live")}
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
        >
          <Activity className="w-5 h-5 text-[#818CF8] mb-2" />
          <div className="text-3xl font-bold text-foreground">
            {liveMatchesCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Live Now</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <TrendingUp className="w-5 h-5 text-destructive mb-2" />
          <div className="text-3xl font-bold text-foreground">0</div>
          <div className="text-xs text-muted-foreground mt-1">Total Runs</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <Users className="w-5 h-5 text-[#3B82F6] mb-2" />
          <div className="text-3xl font-bold text-foreground">0</div>
          <div className="text-xs text-muted-foreground mt-1">
            Active Players
          </div>
        </div>
      </div>

      {/* Match Tabs */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
          <Zap className="w-4 h-4 text-primary" /> Matches
        </h2>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {["All", "Live", "Upcoming", "Recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-primary/20 text-primary font-bold"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* REAL Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(activeTab === "All" || activeTab === "Live") && (
          <>
            <div className="w-full col-span-1 md:col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.06em] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse inline-block"></span>{" "}
              Live Matches
            </div>

            {/* MAP REAL MATCHES */}
            {matches.length === 0 && !isFetchingPage ? (
              <div className="text-muted-foreground text-sm col-span-2 py-4 text-center bg-card rounded-xl border border-border">
                No matches found. Create one!
              </div>
            ) : (
              matches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))
            )}
          </>
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
