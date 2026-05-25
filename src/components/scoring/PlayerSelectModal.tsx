import React, { useState } from "react";

// You can update this interface later if your actual Player model has more fields
export interface Player {
  id: string;
  name: string;
  batting_style?: string;
  bowling_style?: string;
}

interface PlayerSelectModalProps {
  isOpen: boolean;
  role: "Striker" | "Non-Striker" | "Bowler" | null;
  squad: Player[]; // Pass the Batting squad for batters, Bowling squad for bowlers
  currentlyPlayingIds: string[]; // Pass IDs of players already on the field or out
  onSelect: (player: Player) => void;
  onClose: () => void;
}

export const PlayerSelectModal: React.FC<PlayerSelectModalProps> = ({
  isOpen,
  role,
  squad,
  currentlyPlayingIds,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen || !role) return null;

  // Filter out players who are already batting/bowling or out, and apply search
  const availablePlayers =
    squad?.filter(
      (p) =>
        !currentlyPlayingIds.includes(p.id) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* MODAL HEADER */}
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Select New {role}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder={`Search ${role}...`}
            className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* PLAYER LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {availablePlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No available players found.
            </p>
          ) : (
            availablePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => onSelect(player)}
                className="w-full text-left p-3 my-1 border rounded hover:bg-blue-50 focus:bg-blue-100 flex justify-between items-center transition-colors"
              >
                <span className="font-semibold text-gray-800">
                  {player.name}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {role === "Bowler"
                    ? player.bowling_style || "Bowler"
                    : player.batting_style || "Batter"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
