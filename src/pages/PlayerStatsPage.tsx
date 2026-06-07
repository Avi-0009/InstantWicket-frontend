import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Target,
  Activity,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Swords,
  Loader2,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { usePlayerStats } from "../hooks/usePlayerQueries";
import { api } from "../Api/Auth";
import PlayerAnalytics from "../components/scoring/PlayerAnalytics";

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight = false,
}: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`p-5 rounded-xl border ${highlight ? "bg-primary/10 border-primary/30" : "bg-card border-border"} shadow-lg flex flex-col justify-between`}
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
        {title}
      </span>
      <Icon
        className={`w-5 h-5 ${highlight ? "text-primary" : "text-muted-foreground"}`}
      />
    </div>
    <div>
      <h3
        className={`text-3xl font-black ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const PlayerStatsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const [isLoadingMatchStats, setIsLoadingMatchStats] = useState(false);
  // Real Matches State
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isFetchingMatches, setIsFetchingMatches] = useState(true);

  // Stats for the currently visible matches in the table
  const [matchPlayerStats, setMatchPlayerStats] = useState<
    Record<
      string,
      { runs: number | string; wickets: number | string; isMvp?: boolean }
    >
  >({});

  // MVP Calculation State
  const [calculatedMvps, setCalculatedMvps] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Player Profile Stats
  const { data: stats, isLoading, isError, error } = usePlayerStats(id);

  // 🚀 THE MASTER FETCH: Filters legit matches, grabs table stats, and counts MVPs simultaneously
  // 🚀 THE MASTER FETCH: Filters legit matches, grabs table stats, and counts MVPs simultaneously
  useEffect(() => {
    // 🛡️ THE FIX: The URL 'id' might be a user.id, but scorecards use player_id.
    // Once usePlayerStats finishes loading, stats.id holds the TRUE player_id!
    const resolvedPlayerId = stats?.id || id;

    const fetchAndProcessMatches = async () => {
      if (!resolvedPlayerId) return;
      setIsFetchingMatches(true);

      try {
        // 1. Get raw matches
        const res = await api.get(`/matches?limit=50`);
        const rawMatches = res.data?.matches || res.data || [];

        const actuallyPlayedMatches: any[] = [];
        const statsMap: Record<string, any> = {};
        let mvpCount = 0;

        // 2. Check scorecards to verify if the player actually played
        await Promise.all(
          rawMatches.map(async (match: any) => {
            try {
              const scoreRes = await api.get(`/scoring/scorecard/${match.id}`);
              const scorecard = scoreRes.data?.scorecard || [];

              // 🛡️ MATCH CHECK: Check against both the resolved Player ID and URL ID just to be safe
              const myStats = scorecard.find(
                (s: any) =>
                  String(s.player_id) === String(resolvedPlayerId) ||
                  String(s.player_id) === String(id),
              );

              if (myStats) {
                actuallyPlayedMatches.push(match);

                // 🏆 PROPER SINGLE MVP CALCULATION
                let bestPlayerId = null;
                let maxMatchPoints = -1;

                scorecard.forEach((s: any) => {
                  // Calculate fantasy-style points: 1 pt per run, 20 per wicket, 10 per catch
                  const runs = s.runs_scored || 0;
                  const wickets = s.wickets_taken || 0;
                  const catches = s.catches || 0;

                  const playerPoints = runs + wickets * 20 + catches * 10;

                  // Strict check: Only one player can hold the "bestPlayerId"
                  // In case of an exact points tie, the first one evaluated keeps it
                  // (You can also add a tie-breaker here if you want)
                  if (playerPoints > maxMatchPoints) {
                    maxMatchPoints = playerPoints;
                    bestPlayerId = s.player_id;
                  }
                });

                // Check if the current player we are looking at IS the single best player
                const isMvp =
                  String(myStats.player_id) === String(bestPlayerId) &&
                  maxMatchPoints > 0;

                if (isMvp && match.status === "completed") {
                  mvpCount++;
                }

                // 🏏 RESTORED DNB / NOT OUT LOGIC
                const hasBatted =
                  myStats.balls_played > 0 ||
                  myStats.runs_scored > 0 ||
                  !!myStats.dismissal_type;
                let runsDisplay: string | number = "-";

                if (!hasBatted && match.status === "completed") {
                  runsDisplay = "DNB";
                } else if (!hasBatted && match.status !== "completed") {
                  runsDisplay = "-";
                } else {
                  runsDisplay = myStats.runs_scored || 0;
                  if (myStats.is_not_out) runsDisplay = `${runsDisplay}*`;
                }

                // Save their specific stats for the table
                statsMap[match.id] = {
                  runs: runsDisplay,
                  wickets: myStats.wickets_taken ?? "-",
                  isMvp: isMvp,
                };
              }
            } catch (err) {
              // Ignore matches where scorecard fails to load
            }
          }),
        );

        // 3. Sort by newest first
        const sorted = actuallyPlayedMatches.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        // 4. Update all state at once
        setRecentMatches(sorted.slice(0, 20));
        setMatchPlayerStats(statsMap);
        setCalculatedMvps(mvpCount);
      } catch (err) {
        console.error("Failed to fetch recent matches:", err);
      } finally {
        setIsFetchingMatches(false);
      }
    };

    // Wait until `usePlayerStats` is done loading so `stats?.id` is available
    if (!isLoading) {
      fetchAndProcessMatches();
    }
  }, [id, stats?.id, isLoading]);

  // Pagination Logic calculated from actual matches
  const totalPages = Math.ceil(recentMatches.length / itemsPerPage);
  const currentMatches = recentMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-foreground font-semibold animate-pulse">
          Loading Player Stats...
        </p>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-background p-4">
        <PageHeader title="Player Profile" backUrl="/players" />
        <div className="mt-20 text-center text-destructive font-bold">
          Failed to load player stats.{" "}
          {error instanceof Error ? error.message : ""}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-24">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <PageHeader title="Player Profile" backUrl="/players" />

        {/* PROFILE HEADER HERO */}
        <div className="bg-linear-to-br from-card to-background border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-4xl font-bold text-primary shadow-[0_0_20px_var(--color-primary)] shrink-0 uppercase">
              {stats.name
                ? stats.name
                    .trim()
                    .split(/\s+/)
                    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                    .map((word) => word.charAt(0))
                    .join("")
                : "P"}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 capitalize">
                {stats.name || "Unknown Player"}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-border text-muted-foreground rounded-full text-xs font-bold flex items-center gap-1.5 capitalize">
                  <Swords className="w-3.5 h-3.5 text-primary" />{" "}
                  {stats.batting_style || "N/A"}
                </span>
                <span className="px-3 py-1 bg-border text-muted-foreground rounded-full text-xs font-bold flex items-center gap-1.5 capitalize">
                  <Target className="w-3.5 h-3.5 text-destructive" />{" "}
                  {stats.bowling_style || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex gap-6 md:flex-col justify-center items-center md:items-end">
              <div className="text-center md:text-right">
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  Total Points
                </p>
                <p className="text-2xl font-black text-primary">
                  {stats.career_total_points || 0}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  MVP Awards
                </p>
                <p className="text-2xl font-black text-warning flex items-center justify-center md:justify-end gap-1.5">
                  {calculatedMvps === null ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    calculatedMvps
                  )}{" "}
                  <Award className="w-5 h-5" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SHADCN-STYLE TABS */}
        <div className="bg-card border border-border p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar shadow-lg">
          {["overview", "batting", "bowling", "fielding"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-border text-primary shadow-md"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT WITH SMOOTH ANIMATION */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Matches"
                  value={stats.career_matches || 0}
                  icon={Trophy}
                  highlight
                />
                <StatCard
                  title="Total Runs"
                  value={stats.career_runs || 0}
                  icon={Swords}
                />
                <StatCard
                  title="Total Wickets"
                  value={stats.career_wickets || 0}
                  icon={Target}
                />
                <StatCard
                  title="Highest Score"
                  value={`${stats.career_highest_score || 0}*`}
                  icon={Activity}
                />
              </div>
            )}

            {activeTab === "batting" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Runs"
                  value={stats.career_runs || 0}
                  icon={Swords}
                  highlight
                />
                <StatCard
                  title="Strike Rate"
                  value={stats.strike_rate || "0.0"}
                  icon={Activity}
                />
                <StatCard
                  title="100s / 50s"
                  value={`${stats.career_hundreds || 0} / ${stats.career_fifties || 0}`}
                  icon={Award}
                />
                <StatCard
                  title="Boundaries (4s/6s)"
                  value={`${stats.career_fours || 0} / ${stats.career_sixes || 0}`}
                  icon={Target}
                />
              </div>
            )}

            {activeTab === "bowling" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Wickets"
                  value={stats.career_wickets || 0}
                  icon={Target}
                  highlight
                />
                <StatCard
                  title="Economy"
                  value={stats.economy || "0.0"}
                  icon={Activity}
                />
                <StatCard
                  title="Best Bowling"
                  value={`${stats.career_best_bowling_wickets || 0}/${stats.career_best_bowling_runs || 0}`}
                  icon={Trophy}
                />
                <StatCard
                  title="Maidens"
                  value={(stats as any).career_maiden_overs || 0}
                  icon={Shield}
                />
              </div>
            )}

            {activeTab === "fielding" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                  title="Catches"
                  value={stats.career_catches || 0}
                  icon={Shield}
                  highlight
                />
                <StatCard
                  title="Run Outs"
                  value={stats.career_runouts || 0}
                  icon={Target}
                />
                <StatCard
                  title="Stumpings"
                  value={stats.career_stumpings || 0}
                  icon={Activity}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 🔥 NEW: PLAYER VISUAL ANALYTICS (Auto-refreshes via TanStack) */}
        {stats && (
          <div className="mb-8">
            <PlayerAnalytics stats={stats} />
          </div>
        )}

        {/* REAL MATCHES TABLE */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">
              Recent Matches (Last 20)
            </h3>
            {isLoadingMatchStats && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Match</th>
                  <th className="p-4 font-semibold text-center">Format</th>
                  <th className="p-4 font-semibold text-center">Runs</th>
                  <th className="p-4 font-semibold text-center">Wickets</th>
                  <th className="p-4 font-semibold text-center">Result</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isFetchingMatches ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Loading recent matches...
                    </td>
                  </tr>
                ) : currentMatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No matches found for this player yet.
                    </td>
                  </tr>
                ) : (
                  currentMatches.map((match) => {
                    const matchDate = new Date(
                      match.created_at,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    // Team Identification
                    let myTeam = match.team_a_name;
                    let oppTeam = match.team_b_name;
                    let myTeamId = match.team_a_id;

                    const resolvedPlayerId = stats?.id || id;

                    if (
                      (match.team_b_players &&
                        match.team_b_players.some(
                          (p: any) =>
                            String(p.id) === String(resolvedPlayerId) ||
                            String(p.id) === String(id),
                        )) ||
                      String(match.player_team_id) === String(match.team_b_id)
                    ) {
                      myTeam = match.team_b_name;
                      oppTeam = match.team_a_name;
                      myTeamId = match.team_b_id;
                    }

                    // Result Badge Logic
                    let resultBadge = "Live";
                    let badgeClass = "bg-warning/20 text-warning";

                    if (match.status === "completed") {
                      if (match.winner_team_id) {
                        const didWin = match.winner_team_id === myTeamId;
                        resultBadge = didWin ? "Won" : "Lost";
                        badgeClass = didWin
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/20 text-destructive";
                      } else {
                        resultBadge = "Draw";
                        badgeClass =
                          "bg-muted-foretext-muted-foreground/20 text-muted-foreground";
                      }
                    }

                    const pStats = matchPlayerStats[match.id];
                    const runsScored = pStats
                      ? pStats.runs
                      : isLoadingMatchStats
                        ? "..."
                        : "-";
                    const wicketsTaken = pStats
                      ? pStats.wickets
                      : isLoadingMatchStats
                        ? "..."
                        : "-";

                    return (
                      <tr
                        key={match.id}
                        className="border-b border-border/50 hover:bg-card-hover transition-colors relative"
                      >
                        <td className="p-4 text-foreground whitespace-nowrap text-xs">
                          {matchDate}
                        </td>
                        <td className="p-4 font-medium text-sm">
                          <span className="text-foreground font-bold">
                            {myTeam}
                          </span>
                          <span className="text-muted-foreground text-xs px-1.5 italic">
                            vs
                          </span>
                          <span className="text-muted-foreground">
                            {oppTeam}
                          </span>
                        </td>
                        <td className="p-4 text-primary font-bold text-center text-xs">
                          {match.overs_limit} Ov
                        </td>
                        <td className="p-4 text-foreground font-bold text-center align-middle">
                          {runsScored}
                        </td>
                        <td className="p-4 text-foreground font-bold text-center align-middle">
                          {wicketsTaken}
                        </td>
                        <td className="p-4 text-center align-middle">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${badgeClass}`}
                          >
                            {resultBadge}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          {!isFetchingMatches && recentMatches.length > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between bg-background/30">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-bold text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-foreground">
                  {Math.min(currentPage * itemsPerPage, recentMatches.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-foreground">
                  {recentMatches.length}
                </span>{" "}
                results
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  let pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-background border border-primary"
                          : "border border-transparent text-muted-foreground hover:border-border hover:bg-border"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsPage;
