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
    navigate(`/player_stats/${targetId}`);
  };

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-background min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-card border border-border rounded-full hover:bg-card-hover hover:border-primary/50 transition-all shadow-lg text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold text-foreground">Players</h1>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search players by name..."
          className="w-full bg-card border border-border text-foreground rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-border"
        />
      </div>

      {/* PLAYERS LIST GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <Activity className="w-8 h-8 animate-spin mb-4" />
          <p className="text-sm font-bold animate-pulse">Fetching Players...</p>
        </div>
      ) : currentPlayers.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground font-bold">No players found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {currentPlayers.map((player: any, index: number) => {
            // Using the real name from your updated Go backend!
            const displayName = player.name || "Unknown Player";
            const runs = player.career_runs || 0;
            const uniqueKey = player.player_id || player.id || index;

            return (
              <div
                key={uniqueKey}
                onClick={() => handlePlayerClick(player)}
                className="bg-card border border-border p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 hover:bg-card-hover transition-all shadow-lg group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 group-hover:bg-primary group-hover:text-background transition-colors">
                    {/* Get Initials now works because we have the actual name */}
                    {player.name ? (
                      getInitials(player.name)
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{displayName}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {player.batting_style || player.bowling_style
                        ? `${player.batting_style || ""} ${player.bowling_style ? `• ${player.bowling_style}` : ""}`
                        : "Stats"}
                      <span className="ml-1 text-primary font-bold">
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
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-foreground text-sm font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-border hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </main>
  );
};

export default PlayersListPage;
