import React, { useState, useRef, useEffect } from "react";

interface Option {
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

export const CustomDropdown: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
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
        className="w-full flex justify-between items-center bg-card border border-border text-foreground rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      >
        <span
          className={
            selectedPlayer ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedPlayer ? selectedPlayer.name : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute z-[100] w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-muted-foreground text-sm italic">
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
                className={`w-full text-left px-4 py-3 text-sm hover:bg-card-hover transition-colors border-b border-border last:border-b-0 
                  ${
                    value === player.id
                      ? "bg-primary/20 text-primary"
                      : "text-foreground"
                  }`}
              >
                {player.name}
                <span className="text-xs opacity-70">
                  {player.is_captain ? " (C)" : ""}
                  {player.is_wicket_keeper ? " (WK)" : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
