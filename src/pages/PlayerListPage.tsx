import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
} from "lucide-react";
import { getInitials } from "../utils/helpers";
import {
  useAllPlayerStats,
  useSearchPlayerStats,
} from "../hooks/usePlayerQueries";
import { useDebounce } from "../hooks/useDebounce";

const PlayersListPage = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10; // Exactly 10 per page as requested

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isSearching = debouncedSearch.length > 0;

  // Fetch both queries (TanStack is smart enough to cache and handle them)
  const { data: allStats, isLoading: isLoadingAll } = useAllPlayerStats();
  const { data: searchResults, isLoading: isLoadingSearch } =
    useSearchPlayerStats(debouncedSearch);

  // Determine which data array to use based on if the user is typing
  const activeData = isSearching ? searchResults : allStats;
  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;

  // Frontend Pagination Logic
  const safeData = activeData || [];
  const totalPages = Math.ceil(safeData.length / itemsPerPage) || 1;
  const currentPlayers = safeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handlePlayerClick = (player: any) => {
    // Search API returns `player_id`, but GetAll returns `id`
    const targetId = player.player_id || player.id;
    navigate(`/player-stats/${targetId}`);
  };

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-[#061311] min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold text-[#F4FFFD]">Players</h1>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB7B2]" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search players by name..."
          className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#0FAF9A]/50 transition-colors placeholder:text-[#1B3530]"
        />
      </div>

      {/* PLAYERS LIST GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#0FAF9A]">
          <Activity className="w-8 h-8 animate-spin mb-4" />
          <p className="text-sm font-bold animate-pulse">Fetching Players...</p>
        </div>
      ) : currentPlayers.length === 0 ? (
        <div className="text-center py-20 bg-[#0B1F1B] border border-[#1B3530] rounded-xl">
          <p className="text-[#9FB7B2] font-bold">No players found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentPlayers.map((player: any, index: number) => {
            // Normalize data because Go models differ between Search and GetAll
            const displayName =
              player.name || `Player User: ${player.user_id.substring(0, 6)}`;
            const runs = player.career_runs || 0;
            const uniqueKey = player.player_id || player.id || index;

            return (
              <div
                key={uniqueKey}
                onClick={() => handlePlayerClick(player)}
                className="bg-[#0B1F1B] border border-[#1B3530] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#0FAF9A]/50 hover:bg-[#122A25] transition-all shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0FAF9A]/10 text-[#0FAF9A] flex items-center justify-center font-bold border border-[#0FAF9A]/20 group-hover:bg-[#0FAF9A] group-hover:text-[#061311] transition-colors">
                    {player.name ? (
                      getInitials(player.name)
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F4FFFD]">{displayName}</h3>
                    <p className="text-xs text-[#9FB7B2] capitalize mt-0.5">
                      {player.batting_style || player.bowling_style
                        ? `${player.batting_style || ""} ${player.bowling_style ? `• ${player.bowling_style}` : ""}`
                        : "Stats"}
                      <span className="ml-1 text-[#0FAF9A] font-bold">
                        | {runs} Runs
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FRONTEND PAGINATION (10 per page) */}
      {!isLoading && safeData.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] hover:text-[#F4FFFD] disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[#F4FFFD] text-sm font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] hover:text-[#F4FFFD] disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </main>
  );
};

export default PlayersListPage;
