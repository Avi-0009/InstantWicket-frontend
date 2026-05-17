import React, { useState } from "react";
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
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";

// --- MOCK DATA BASED ON YOUR EXACT SCHEMA ---
const mockPlayerStats = {
  name: "Prakhar Sahu",
  batting_style: "Right-hand bat",
  bowling_style: "Right-arm offbreak",
  career_matches: 148,
  career_runs: 4820,
  career_wickets: 87,
  career_catches: 42,
  career_runouts: 12,
  career_stumpings: 3,
  career_fours: 412,
  career_sixes: 184,
  strike_rate: 142.5,
  economy: 7.24,
  career_highest_score: 118,
  career_fifties: 28,
  career_hundreds: 4,
  career_best_bowling_wickets: 5,
  career_best_bowling_runs: 24,
  career_mvps: 18,
  career_total_points: 2450,
};

// Mock Match Log for Pagination
const mockMatchLog = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  date: `2026-05-${String((i % 30) + 1).padStart(2, "0")}`,
  opponent: `Team ${String.fromCharCode(65 + (i % 5))}`,
  runs: Math.floor(Math.random() * 80),
  wickets: Math.floor(Math.random() * 4),
  result: Math.random() > 0.5 ? "Won" : "Lost",
}));

// --- SHADCN-INSPIRED UI COMPONENTS ---

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

// --- MAIN COMPONENT ---

const PlayerStatsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination Logic
  const totalPages = Math.ceil(mockMatchLog.length / itemsPerPage);
  const currentMatches = mockMatchLog.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-[#061311] font-sans pb-24">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <PageHeader title="Player Profile" backUrl="/players" />

        {/* PROFILE HEADER HERO */}
        <div className="bg-gradient-to-br from-[#0B1F1B] to-[#061311] border border-[#1B3530] rounded-2xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0FAF9A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-[#0FAF9A]/20 border-2 border-[#0FAF9A] flex items-center justify-center text-4xl font-bold text-[#0FAF9A] shadow-[0_0_20px_rgba(15,175,154,0.3)] shrink-0">
              {mockPlayerStats.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-[#F4FFFD] mb-2">
                {mockPlayerStats.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-[#1B3530] text-[#9FB7B2] rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-[#0FAF9A]" />{" "}
                  {mockPlayerStats.batting_style}
                </span>
                <span className="px-3 py-1 bg-[#1B3530] text-[#9FB7B2] rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#FF6B6B]" />{" "}
                  {mockPlayerStats.bowling_style}
                </span>
              </div>
            </div>

            <div className="flex gap-4 md:flex-col justify-center">
              <div className="text-center md:text-right">
                <p className="text-[#9FB7B2] text-xs font-bold uppercase">
                  Total Points
                </p>
                <p className="text-2xl font-black text-[#0FAF9A]">
                  {mockPlayerStats.career_total_points}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[#9FB7B2] text-xs font-bold uppercase">
                  MVP Awards
                </p>
                <p className="text-2xl font-black text-[#F59E0B] flex items-center justify-center md:justify-end gap-1">
                  {mockPlayerStats.career_mvps} <Award className="w-5 h-5" />
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
                  value={mockPlayerStats.career_matches}
                  icon={Trophy}
                  highlight
                />
                <StatCard
                  title="Total Runs"
                  value={mockPlayerStats.career_runs}
                  icon={Swords}
                />
                <StatCard
                  title="Total Wickets"
                  value={mockPlayerStats.career_wickets}
                  icon={Target}
                />
                <StatCard
                  title="Highest Score"
                  value={`${mockPlayerStats.career_highest_score}*`}
                  icon={Activity}
                />
              </div>
            )}

            {activeTab === "batting" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Runs"
                  value={mockPlayerStats.career_runs}
                  icon={Swords}
                  highlight
                />
                <StatCard
                  title="Strike Rate"
                  value={mockPlayerStats.strike_rate}
                  icon={Activity}
                />
                <StatCard
                  title="100s / 50s"
                  value={`${mockPlayerStats.career_hundreds} / ${mockPlayerStats.career_fifties}`}
                  icon={Award}
                />
                <StatCard
                  title="Boundaries (4s/6s)"
                  value={`${mockPlayerStats.career_fours} / ${mockPlayerStats.career_sixes}`}
                  icon={Target}
                />
              </div>
            )}

            {activeTab === "bowling" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Wickets"
                  value={mockPlayerStats.career_wickets}
                  icon={Target}
                  highlight
                />
                <StatCard
                  title="Economy"
                  value={mockPlayerStats.economy}
                  icon={Activity}
                />
                <StatCard
                  title="Best Bowling"
                  value={`${mockPlayerStats.career_best_bowling_wickets}/${mockPlayerStats.career_best_bowling_runs}`}
                  icon={Trophy}
                />
                <StatCard title="Maidens" value="14" icon={Shield} />{" "}
                {/* Added a mock value for maidens */}
              </div>
            )}

            {activeTab === "fielding" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                  title="Catches"
                  value={mockPlayerStats.career_catches}
                  icon={Shield}
                  highlight
                />
                <StatCard
                  title="Run Outs"
                  value={mockPlayerStats.career_runouts}
                  icon={Target}
                />
                <StatCard
                  title="Stumpings"
                  value={mockPlayerStats.career_stumpings}
                  icon={Activity}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* RECENT INNINGS TABLE WITH NOWTED/SHADCN-STYLE PAGINATION */}
        <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#1B3530]">
            <h3 className="text-lg font-bold text-[#F4FFFD]">Recent Matches</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#061311]/50 border-b border-[#1B3530] text-[#9FB7B2] text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Opponent</th>
                  <th className="p-4 font-semibold text-right">Runs</th>
                  <th className="p-4 font-semibold text-right">Wickets</th>
                  <th className="p-4 font-semibold text-center">Result</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {currentMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-[#1B3530]/50 hover:bg-[#122A25] transition-colors"
                  >
                    <td className="p-4 text-[#F4FFFD]">{match.date}</td>
                    <td className="p-4 text-[#F4FFFD] font-medium">
                      {match.opponent}
                    </td>
                    <td className="p-4 text-[#0FAF9A] font-bold text-right">
                      {match.runs}
                    </td>
                    <td className="p-4 text-[#F4FFFD] font-bold text-right">
                      {match.wickets}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                          match.result === "Won"
                            ? "bg-[#0FAF9A]/20 text-[#0FAF9A]"
                            : "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                        }`}
                      >
                        {match.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 border-t border-[#1B3530] flex items-center justify-between bg-[#061311]/30">
            <p className="text-xs text-[#9FB7B2]">
              Showing{" "}
              <span className="font-bold text-[#F4FFFD]">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[#F4FFFD]">
                {Math.min(currentPage * itemsPerPage, mockMatchLog.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#F4FFFD]">
                {mockMatchLog.length}
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

              {/* Generate Page Numbers dynamically */}
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                // Logic to show a window of pages around current page
                let pageNum = currentPage > 2 ? currentPage - 2 + idx : idx + 1;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#0FAF9A] text-[#061311] border border-[#0FAF9A]"
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
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsPage;
