import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Activity, Inbox } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { useMatches } from "../hooks/useMatchQueries"; // Import our real API hook

const MatchesListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch real matches from the backend
  const { data, isLoading, isError } = useMatches();

  // Extract matches array, defaulting to an empty array if undefined
  const matches = data?.matches || [];

  // Filter based on the selected tab
  const filteredMatches =
    activeTab === "all"
      ? matches
      : matches.filter((m: any) => m.status === activeTab);

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-background min-h-screen">
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#0FAF9A]">
          <Activity className="animate-spin w-8 h-8 mb-4" />
          <p className="text-sm font-bold animate-pulse">Loading Matches...</p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-[#FF6B6B]/15 text-[#FF6B6B] p-4 rounded-full mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-[#F4FFFD] font-bold text-lg mb-2">
            Oops! Something went wrong.
          </h3>
          <p className="text-[#9FB7B2] text-sm">
            Failed to load matches from the server.
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        /* Beautiful Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0B1F1B] border border-[#1B3530] rounded-xl border-dashed">
          <div className="bg-[#1B3530]/50 p-4 rounded-full mb-4">
            <Inbox className="w-10 h-10 text-[#0FAF9A]" />
          </div>
          <h3 className="text-[#F4FFFD] font-bold text-lg mb-2">
            No Matches Found
          </h3>
          <p className="text-[#9FB7B2] text-sm mb-6 max-w-sm px-4">
            {activeTab === "all"
              ? "You haven't created or participated in any matches yet. Start a new game to see it here!"
              : `There are no ${activeTab === "ongoing" ? "live" : activeTab} matches at the moment.`}
          </p>
          {activeTab === "all" && (
            <button
              onClick={() =>
                navigate("/new-match")
              } /* Make sure this points to your create match route */
              className="bg-[#0FAF9A] text-background px-6 py-2.5 rounded-lg font-bold hover:bg-[#0dd3b9] transition-all shadow-[0_0_15px_rgba(15,175,154,0.3)]"
            >
              Start a New Match
            </button>
          )}
        </div>
      ) : (
        /* Real Matches List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match: any) => (
            <div
              key={match.id}
              onClick={() => navigate(`/match/${match.id}`)}
              className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-5 hover:border-[#0FAF9A]/50 hover:bg-[#122A25] transition-all cursor-pointer shadow-lg relative overflow-hidden group"
            >
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#9FB7B2] flex items-center gap-1.5 uppercase tracking-wider">
                  {match.overs_limit} OVERS
                </span>

                {/* Dynamically render badge based on real API status */}
                {match.status === "ongoing" && (
                  <div className="bg-[#FF6B6B]/15 text-[#FF6B6B] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-[#FF6B6B]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse"></span>{" "}
                    LIVE
                  </div>
                )}
                {(match.status === "upcoming" || !match.status) && (
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

              {/* Teams - Mapped to real backend fields */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F4FFFD] text-lg group-hover:text-[#0FAF9A] transition-colors">
                    {match.team_a_name}
                  </span>
                  {/* Scores will go here later when your stats API is ready */}
                  <span className="font-bold text-[#9FB7B2] text-sm">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F4FFFD] text-lg group-hover:text-[#0FAF9A] transition-colors">
                    {match.team_b_name}
                  </span>
                  <span className="font-bold text-[#9FB7B2] text-sm">-</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#1B3530]/50 text-xs text-[#9FB7B2]">
                {match.status === "completed" && match.winner_team_id ? (
                  <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Result Available
                  </span>
                ) : match.status === "ongoing" ? (
                  <span className="flex items-center gap-1.5 text-[#FF6B6B]">
                    <Activity className="w-3.5 h-3.5" /> Match in progress
                  </span>
                ) : (
                  <span>
                    Toss won by{" "}
                    {match.tos_winner_team_id === match.team_a_id
                      ? match.team_a_name
                      : match.team_b_name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MatchesListPage;
