import React, { useState, useRef, useEffect } from "react";

export interface Option {
  id: string;
  name: string;
  is_captain?: boolean;
  is_wicket_keeper?: boolean;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}

// Changed to default export so it matches LiveScoring.tsx imports perfectly
export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPlayer = options.find((o) => o.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-[#0D2420] border border-[#1B3530] text-[#F4FFFD] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0FAF9A] transition-all"
      >
        <span
          className={`truncate pr-2 ${
            selectedPlayer
              ? "text-[#F4FFFD] font-bold"
              : "text-[#9FB7B2] font-medium"
          }`}
        >
          {selectedPlayer ? selectedPlayer.name : placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#9FB7B2] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {/* Dropdown Menu (Scrollable) */}
      {isOpen && (
        // Changed z-100 to z-[100] so it perfectly floats above your dashboard
        <div className="absolute z-[100] w-full mt-2 bg-[#0B1F1B] border border-[#1B3530] rounded-lg shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-[#9FB7B2] text-sm italic">
              No players available
            </div>
          ) : (
            options.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  onChange(player.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-[#1B3530]/50 last:border-b-0 
                  ${
                    value === player.id
                      ? "bg-[#0FAF9A]/20 text-[#0FAF9A] font-bold"
                      : "text-[#F4FFFD] hover:bg-[#1B3530]"
                  }`}
              >
                {player.name}
                {(player.is_captain || player.is_wicket_keeper) && (
                  <span className="text-[10px] ml-2 text-[#0FAF9A] font-black">
                    {player.is_captain ? "(C) " : ""}
                    {player.is_wicket_keeper ? "(WK)" : ""}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
