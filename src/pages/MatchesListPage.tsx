import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Activity } from "lucide-react";
import PageHeader from "../components/common/PageHeader";

// Mock data to simulate different match states
const mockMatches = [
  {
    id: 1,
    teamA: "Warriors",
    teamB: "Titans",
    status: "ongoing",
    format: "T20",
    date: "Today",
    scoreA: "142/4 (15.4)",
    scoreB: "Yet to bat",
  },
  {
    id: 2,
    teamA: "Spartans",
    teamB: "Royals",
    status: "completed",
    format: "ODI",
    date: "Yesterday",
    scoreA: "284/8 (50.0)",
    scoreB: "285/6 (48.2)",
    result: "Royals won by 4 wkts",
  },
  {
    id: 3,
    teamA: "Knights",
    teamB: "Dragons",
    status: "upcoming",
    format: "T20",
    date: "Tomorrow, 7:00 PM",
    scoreA: "",
    scoreB: "",
  },
  {
    id: 4,
    teamA: "Eagles",
    teamB: "Hawks",
    status: "completed",
    format: "T10",
    date: "24 May 2026",
    scoreA: "112/3 (10.0)",
    scoreB: "98/7 (10.0)",
    result: "Eagles won by 14 runs",
  },
];

const MatchesListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredMatches =
    activeTab === "all"
      ? mockMatches
      : mockMatches.filter((m) => m.status === activeTab);

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-[#061311] min-h-screen">
      {/* Header Using Your Smart Component */}
      <PageHeader title="Matches" backUrl="/" />

      {/* Filter Tabs */}
      <div className="bg-[#0B1F1B] border border-[#1B3530] p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar shadow-lg">
        {["all", "ongoing", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#1B3530] text-[#0FAF9A] shadow-md border border-[#1B3530]"
                : "text-[#9FB7B2] hover:bg-[#122A25] hover:text-[#F4FFFD]"
            }`}
          >
            {tab === "ongoing" ? "Live" : tab}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            onClick={() => navigate(`/match/${match.id}`)}
            className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-5 hover:border-[#0FAF9A]/50 hover:bg-[#122A25] transition-all cursor-pointer shadow-lg relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#9FB7B2] flex items-center gap-1.5 uppercase tracking-wider">
                {match.format} MATCH
              </span>
              {match.status === "ongoing" && (
                <div className="bg-[#FF6B6B]/15 text-[#FF6B6B] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-[#FF6B6B]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse"></span>{" "}
                  LIVE
                </div>
              )}
              {match.status === "upcoming" && (
                <div className="bg-[#0FAF9A]/15 text-[#0FAF9A] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-[#0FAF9A]/20">
                  <Calendar className="w-3 h-3" /> UPCOMING
                </div>
              )}
              {match.status === "completed" && (
                <div className="bg-[#1B3530] text-[#9FB7B2] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  COMPLETED
                </div>
              )}
            </div>

            {/* Teams & Scores */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#F4FFFD] text-lg">
                  {match.teamA}
                </span>
                <span className="font-bold text-[#0FAF9A]">{match.scoreA}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#F4FFFD] text-lg">
                  {match.teamB}
                </span>
                <span
                  className={`font-bold ${match.status === "ongoing" ? "text-[#9FB7B2]" : "text-[#0FAF9A]"}`}
                >
                  {match.scoreB}
                </span>
              </div>
            </div>

            {/* Footer / Result */}
            <div className="pt-3 border-t border-[#1B3530]/50 text-xs text-[#9FB7B2]">
              {match.status === "completed" ? (
                <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> {match.result}
                </span>
              ) : match.status === "upcoming" ? (
                <span>Starts on {match.date}</span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#FF6B6B]">
                  <Activity className="w-3.5 h-3.5" /> Ongoing
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MatchesListPage;
