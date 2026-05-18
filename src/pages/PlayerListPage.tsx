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
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
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

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search, ChevronLeft, ChevronRight, Activity } from "lucide-react";
// import { getInitials } from "../utils/helpers";

// // Define the exact shape of your Go backend response
// interface Player {
//   id: string;
//   user_id: string;
//   name: string;
//   batting_style: string;
//   bowling_style: string;
//   career_matches: number;
// }

// const PlayersListPage = () => {
//   const navigate = useNavigate();

//   // Real API State
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const itemsPerPage = 8;

//   // Using your local IP for the backend (Assuming Go runs on port 8080)
//   const API_URL = "http://192.168.0.236:8080/api/players";

//   useEffect(() => {
//     const fetchPlayers = async () => {
//       setIsLoading(true);
//       try {
//         // Build the URL with query parameters exactly as your Go handler expects
//         const url = new URL(API_URL);
//         url.searchParams.append("page", currentPage.toString());
//         url.searchParams.append("limit", itemsPerPage.toString());

//         if (searchQuery) {
//           url.searchParams.append("search", searchQuery);
//         }

//         const response = await fetch(url.toString());
//         if (!response.ok) throw new Error("Failed to fetch players");

//         const data = await response.json();

//         setPlayers(data.players || []);
//         // Calculate total pages based on the "total" count returned by your Go DB helper
//         setTotalPages(Math.ceil((data.total || 0) / itemsPerPage) || 1);
//       } catch (error) {
//         console.error("Error fetching players:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     // Debounce the search so we don't spam the Go backend on every keystroke
//     const timeoutId = setTimeout(() => {
//       fetchPlayers();
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [currentPage, searchQuery]);

//   // When user types, update search and reset back to page 1
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1);
//   };

//   return (
//     <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-[#061311] min-h-screen">
//       {/* HEADER */}
//       <div className="flex items-center gap-3 mb-6">
//         <button
//           onClick={() => navigate("/")}
//           className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD]"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </button>
//         <h1 className="text-[28px] font-bold text-[#F4FFFD]">Players</h1>
//       </div>

//       {/* SEARCH BAR */}
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB7B2]" />
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={handleSearchChange}
//           placeholder="Search players by name..."
//           className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#0FAF9A]/50 transition-colors placeholder:text-[#1B3530]"
//         />
//       </div>

//       {/* PLAYERS LIST GRID */}
//       {isLoading ? (
//         // Loading State
//         <div className="flex flex-col items-center justify-center py-20 text-[#0FAF9A]">
//           <Activity className="w-8 h-8 animate-spin mb-4" />
//           <p className="text-sm font-bold animate-pulse">Fetching Players...</p>
//         </div>
//       ) : players.length === 0 ? (
//         // Empty State
//         <div className="text-center py-20 bg-[#0B1F1B] border border-[#1B3530] rounded-xl">
//           <p className="text-[#9FB7B2] font-bold">No players found.</p>
//         </div>
//       ) : (
//         // Real Data Rendering
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
//           {players.map((player) => (
//             <div
//               key={player.id}
//               onClick={() => navigate(`/player-stats/${player.id}`)}
//               className="bg-[#0B1F1B] border border-[#1B3530] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-[#0FAF9A]/50 hover:bg-[#122A25] transition-all shadow-lg group"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-full bg-[#0FAF9A]/10 text-[#0FAF9A] flex items-center justify-center font-bold border border-[#0FAF9A]/20 group-hover:bg-[#0FAF9A] group-hover:text-[#061311] transition-colors">
//                   {getInitials(player.name)}
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-[#F4FFFD]">{player.name}</h3>
//                   <p className="text-xs text-[#9FB7B2] capitalize mt-0.5">
//                     {/* Combine styles if they exist, or show fallback */}
//                     {player.batting_style || player.bowling_style
//                       ? `${player.batting_style || "N/A"} • ${player.bowling_style || "N/A"}`
//                       : "All-Rounder"}
//                     <span className="ml-1 text-[#0FAF9A] font-bold">
//                       | {player.career_matches} Matches
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* SERVER-SIDE PAGINATION */}
//       {!isLoading && players.length > 0 && (
//         <div className="flex items-center justify-center gap-2 mt-8">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] disabled:opacity-50 transition-colors"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <span className="text-[#F4FFFD] text-sm font-medium px-4">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#1B3530] text-[#9FB7B2] hover:bg-[#1B3530] disabled:opacity-50 transition-colors"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       )}
//     </main>
//   );
// };

// export default PlayersListPage;
