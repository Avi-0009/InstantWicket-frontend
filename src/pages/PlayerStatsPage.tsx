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

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  highlight = false,
}: any) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`p-5 rounded-xl border ${highlight ? "bg-[#0FAF9A]/10 border-[#0FAF9A]/30" : "bg-[#0B1F1B] border-[#1B3530]"} shadow-lg flex flex-col justify-between`}
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-[#9FB7B2] text-xs font-bold uppercase tracking-wider">
        {title}
      </span>
      <Icon
        className={`w-5 h-5 ${highlight ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
      />
    </div>
    <div>
      <h3
        className={`text-3xl font-black ${highlight ? "text-[#0FAF9A]" : "text-[#F4FFFD]"}`}
      >
        {value}
      </h3>
      {subtitle && <p className="text-xs text-[#9FB7B2] mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const PlayerStatsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Real Matches State
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isFetchingMatches, setIsFetchingMatches] = useState(true);

  // Stats for the currently visible matches in the table
  const [matchPlayerStats, setMatchPlayerStats] = useState<
    Record<string, { runs: number | string; wickets: number | string }>
  >({});
  const [isLoadingMatchStats, setIsLoadingMatchStats] = useState(false);

  // MVP Calculation State
  const [calculatedMvps, setCalculatedMvps] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Player Profile Stats
  const { data: stats, isLoading, isError, error } = usePlayerStats(id);

  // Fetch Actual Recent Matches (Limited to 20)
  useEffect(() => {
    const fetchRecentMatches = async () => {
      if (!id) return;
      setIsFetchingMatches(true);
      try {
        const res = await api.get(`/matches?limit=50`);
        const rawMatches = res.data?.matches || res.data || [];

        // Filter out matches that belong to this player
        const playerAssociatedMatches = rawMatches.filter(
          (m: any) =>
            m.created_by === id ||
            m.umpire_id === id ||
            m.status === "completed",
        );

        // Sort by newest first
        const sorted = playerAssociatedMatches.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setRecentMatches(sorted.slice(0, 20));
      } catch (err) {
        console.error("Failed to fetch recent matches:", err);
      } finally {
        setIsFetchingMatches(false);
      }
    };

    fetchRecentMatches();
  }, [id]);

  // Pagination Logic calculated from actual matches
  const totalPages = Math.ceil(recentMatches.length / itemsPerPage);
  const currentMatches = recentMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Fetch Scorecards ONLY for the 5 currently visible matches
  useEffect(() => {
    const fetchSpecificMatchStats = async () => {
      if (!currentMatches.length || !id) return;
      setIsLoadingMatchStats(true);
      const newStats: Record<string, any> = {};

      await Promise.all(
        currentMatches.map(async (match) => {
          if (matchPlayerStats[match.id]) return;

          try {
            const res = await api.get(`/scoring/scorecard/${match.id}`);
            const scorecard = res.data?.scorecard || [];
            const myStats = scorecard.find((s: any) => s.player_id === id);

            newStats[match.id] = {
              runs: myStats?.runs_scored ?? "-",
              wickets: myStats?.wickets_taken ?? "-",
            };
          } catch (error) {
            newStats[match.id] = { runs: "-", wickets: "-" };
          }
        }),
      );

      if (Object.keys(newStats).length > 0) {
        setMatchPlayerStats((prev) => ({ ...prev, ...newStats }));
      }
      setIsLoadingMatchStats(false);
    };

    fetchSpecificMatchStats();
  }, [currentMatches, id]);

  // 🏆 BACKGROUND MVP CALCULATOR 🏆
  useEffect(() => {
    const calculateTotalMvps = async () => {
      if (!id || recentMatches.length === 0) {
        if (!isFetchingMatches) setCalculatedMvps(0);
        return;
      }

      const completedMatches = recentMatches.filter(
        (m) => m.status === "completed",
      );
      if (completedMatches.length === 0) {
        setCalculatedMvps(0);
        return;
      }

      let mvpCount = 0;

      await Promise.all(
        completedMatches.map(async (match) => {
          try {
            const res = await api.get(`/scoring/scorecard/${match.id}`);
            const scorecard = res.data?.scorecard || [];

            let maxRuns = 0;
            let playerRuns = 0;

            scorecard.forEach((s: any) => {
              if (s.runs_scored > maxRuns) maxRuns = s.runs_scored;
              if (s.player_id === id) playerRuns = s.runs_scored;
            });

            // Player is MVP if they scored the highest in the match (and actually scored > 0)
            if (playerRuns === maxRuns && playerRuns > 0) {
              mvpCount++;
            }
          } catch (err) {
            console.error("Failed to fetch match for MVP calculation", err);
          }
        }),
      );

      setCalculatedMvps(mvpCount);
    };

    calculateTotalMvps();
  }, [recentMatches, id, isFetchingMatches]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0FAF9A] animate-spin mb-4" />
        <p className="text-[#F4FFFD] font-semibold animate-pulse">
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
        <div className="bg-linear-to-br from-[#0B1F1B] to-background border border-[#1B3530] rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0FAF9A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[#0FAF9A]/20 border-2 border-[#0FAF9A] flex items-center justify-center text-4xl font-bold text-[#0FAF9A] shadow-[0_0_20px_rgba(15,175,154,0.3)] shrink-0 capitalize">
              {stats.name ? stats.name.charAt(0) : "P"}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-[#F4FFFD] mb-2 capitalize">
                {stats.name || "Unknown Player"}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-[#1B3530] text-[#9FB7B2] rounded-full text-xs font-bold flex items-center gap-1.5 capitalize">
                  <Swords className="w-3.5 h-3.5 text-[#0FAF9A]" />{" "}
                  {stats.batting_style || "N/A"}
                </span>
                <span className="px-3 py-1 bg-[#1B3530] text-[#9FB7B2] rounded-full text-xs font-bold flex items-center gap-1.5 capitalize">
                  <Target className="w-3.5 h-3.5 text-[#FF6B6B]" />{" "}
                  {stats.bowling_style || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex gap-6 md:flex-col justify-center items-center md:items-end">
              <div className="text-center md:text-right">
                <p className="text-[#9FB7B2] text-xs font-bold uppercase">
                  Total Points
                </p>
                <p className="text-2xl font-black text-[#0FAF9A]">
                  {stats.career_total_points || 0}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[#9FB7B2] text-xs font-bold uppercase">
                  MVP Awards
                </p>
                <p className="text-2xl font-black text-[#F59E0B] flex items-center justify-center md:justify-end gap-1.5">
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
        <div className="bg-[#0B1F1B] border border-[#1B3530] p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar shadow-lg">
          {["overview", "batting", "bowling", "fielding"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#1B3530] text-[#0FAF9A] shadow-md"
                  : "text-[#9FB7B2] hover:bg-[#122A25] hover:text-[#F4FFFD]"
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

        {/* REAL MATCHES TABLE */}
        <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#1B3530] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#F4FFFD]">
              Recent Matches (Last 20)
            </h3>
            {isLoadingMatchStats && (
              <Loader2 className="w-4 h-4 text-[#0FAF9A] animate-spin" />
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-[#1B3530] text-[#9FB7B2] text-xs uppercase tracking-wider">
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
                    <td colSpan={6} className="p-8 text-center text-[#9FB7B2]">
                      Loading recent matches...
                    </td>
                  </tr>
                ) : currentMatches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#9FB7B2]">
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

                    if (
                      (match.team_b_players &&
                        match.team_b_players.some((p: any) => p.id === id)) ||
                      match.player_team_id === match.team_b_id
                    ) {
                      myTeam = match.team_b_name;
                      oppTeam = match.team_a_name;
                      myTeamId = match.team_b_id;
                    }

                    // Result Badge Logic
                    let resultBadge = "Live";
                    let badgeClass = "bg-[#F59E0B]/20 text-[#F59E0B]";

                    if (match.status === "completed") {
                      if (match.winner_team_id) {
                        const didWin = match.winner_team_id === myTeamId;
                        resultBadge = didWin ? "Won" : "Lost";
                        badgeClass = didWin
                          ? "bg-[#0FAF9A]/20 text-[#0FAF9A]"
                          : "bg-[#FF6B6B]/20 text-[#FF6B6B]";
                      } else {
                        resultBadge = "Draw";
                        badgeClass = "bg-[#9FB7B2]/20 text-[#9FB7B2]";
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
                        className="border-b border-[#1B3530]/50 hover:bg-[#122A25] transition-colors relative"
                      >
                        <td className="p-4 text-[#F4FFFD] whitespace-nowrap text-xs">
                          {matchDate}
                        </td>
                        <td className="p-4 font-medium text-sm">
                          <span className="text-[#F4FFFD] font-bold">
                            {myTeam}
                          </span>
                          <span className="text-[#9FB7B2] text-xs px-1.5 italic">
                            vs
                          </span>
                          <span className="text-[#9FB7B2]">{oppTeam}</span>
                        </td>
                        <td className="p-4 text-[#0FAF9A] font-bold text-center text-xs">
                          {match.overs_limit} Ov
                        </td>
                        <td className="p-4 text-[#F4FFFD] font-bold text-center align-middle">
                          {runsScored}
                        </td>
                        <td className="p-4 text-[#F4FFFD] font-bold text-center align-middle">
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
            <div className="p-4 border-t border-[#1B3530] flex items-center justify-between bg-background/30">
              <p className="text-xs text-[#9FB7B2]">
                Showing{" "}
                <span className="font-bold text-[#F4FFFD]">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-[#F4FFFD]">
                  {Math.min(currentPage * itemsPerPage, recentMatches.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#F4FFFD]">
                  {recentMatches.length}
                </span>{" "}
                results
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] hover:text-[#F4FFFD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          ? "bg-[#0FAF9A] text-background border border-[#0FAF9A]"
                          : "border border-transparent text-[#9FB7B2] hover:border-[#1B3530] hover:bg-[#1B3530]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] hover:text-[#F4FFFD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
