import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import { getInitials } from "../utils/helpers";

const mockPlayers = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  name: `Player ${i + 1}`,
  role: i % 3 === 0 ? "Bowler" : i % 2 === 0 ? "All-Rounder" : "Batter",
  matches: Math.floor(Math.random() * 100) + 10,
}));

const PlayersListPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(mockPlayers.length / itemsPerPage);

  const currentPlayers = mockPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-[#061311] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-[#F4FFFD]">Players</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB7B2]" />
        <input
          type="text"
          placeholder="Search players..."
          className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#0FAF9A]/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {currentPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => navigate("/player-stats")}
            className="bg-[#0B1F1B] border border-[#1B3530] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#0FAF9A]/50 hover:bg-[#122A25] transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0FAF9A]/10 text-[#0FAF9A] flex items-center justify-center font-bold border border-[#0FAF9A]/20">
                {getInitials(player.name)}
              </div>
              <div>
                <h3 className="font-bold text-[#F4FFFD]">{player.name}</h3>
                <p className="text-xs text-[#9FB7B2]">
                  {player.role} • {player.matches} Matches
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] disabled:opacity-50 transition-colors"
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
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] disabled:opacity-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
};

export default PlayersListPage;
