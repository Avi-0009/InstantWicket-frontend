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
  direction?: "up" | "down"; // Adds the ability to open upwards
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  direction = "down", // Defaults to down so other pages stay exactly the same
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Determines where the menu appears based on the direction prop
  const positionClasses =
    direction === "up" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-background border border-border text-foreground rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      >
        <span
          className={`truncate pr-2 ${
            selectedPlayer
              ? "text-foreground font-bold"
              : "text-muted-foreground font-medium"
          }`}
        >
          {selectedPlayer ? selectedPlayer.name : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
            isOpen ? (direction === "up" ? "-rotate-180" : "rotate-180") : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={direction === "up" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute z-[100] w-full ${positionClasses} bg-card border border-border rounded-lg shadow-2xl overflow-y-auto no-scrollbar`}
          style={{ maxHeight: "35vh" }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-muted-foreground text-sm italic">
              No options available
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
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-border/50 last:border-b-0 
                  ${
                    value === player.id
                      ? "bg-primary/20 text-primary font-bold"
                      : "text-foreground hover:bg-card-hover"
                  }`}
              >
                {player.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
