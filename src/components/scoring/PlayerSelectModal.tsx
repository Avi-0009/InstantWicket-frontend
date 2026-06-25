import React, { useState, useEffect } from "react";

export interface Player {
  id: string;
  name: string;
  is_common_player?: boolean;
  is_captain?: boolean;
  is_wicket_keeper?: boolean;
  is_retired?: boolean;
}

interface PlayerSelectModalProps {
  isOpen: boolean;
  role: "Striker" | "Non-Striker" | "Bowler" | null;
  squad: Player[];
  currentlyPlayingIds: string[];
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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const resetTimer = setTimeout(() => setSelectedPlayerId(""), 0);
      return () => clearTimeout(resetTimer);
    }
  }, [isOpen]);

  if (!isOpen || !role) return null;

  // Filter out players who are already assigned to the pitch
  const availablePlayers =
    squad?.filter((p) => !currentlyPlayingIds.includes(p.id)) || [];

  return (
    // FIX 1: Changed z-100 to z-[100] so it overlays the sticky header properly
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-card-hover px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">Assign {role}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Select from Squad
          </label>

          {/* FIX 2: Native Tailwind-styled select to guarantee ID mapping works perfectly */}
          <select
            className="w-full bg-background text-foreground border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
          >
            <option value="" disabled>
              -- Choose {role} --
            </option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.is_wicket_keeper ? "(WK)" : ""}{" "}
                {p.is_captain ? "(C)" : ""}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:bg-card-hover hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const p = availablePlayers.find(
                  (x) => x.id === selectedPlayerId,
                );
                if (p) onSelect(p);
              }}
              disabled={!selectedPlayerId}
              className="flex-1 py-3 rounded-lg text-sm font-bold bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
