import React, { useState } from "react";
import type { Player } from "./PlayerSelectModal";

interface WicketFormProps {
  bowlingSquad: Player[];
  onSubmit: (wicketType: string, fielderId: string | null) => void;
  onCancel: () => void;
}

const WICKET_TYPES = [
  { id: "bowled", label: "Bowled" },
  { id: "caught", label: "Caught" },
  { id: "lbw", label: "LBW" },
  { id: "run_out", label: "Run Out" },
  { id: "stumped", label: "Stumped" },
  { id: "hit_wicket", label: "Hit Wicket" },
];

export const WicketForm: React.FC<WicketFormProps> = ({
  bowlingSquad,
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState<string>("bowled");
  const [fielderId, setFielderId] = useState<string>("");

  const requiresFielder = ["caught", "run_out", "stumped"].includes(type);

  const handleSubmit = () => {
    if (requiresFielder && !fielderId) return; // Prevent submission without a fielder
    onSubmit(type, requiresFielder ? fielderId : null);
  };

  return (
    <div className="bg-[#0B1F1B] border border-red-900/50 p-4 rounded-xl shadow-lg mt-4 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-red-400 font-bold mb-3 uppercase tracking-wider text-sm">
        Wicket Details
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {WICKET_TYPES.map((w) => (
          <button
            key={w.id}
            onClick={() => {
              setType(w.id);
              if (!["caught", "run_out", "stumped"].includes(w.id))
                setFielderId("");
            }}
            className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
              type === w.id
                ? "bg-red-600 text-white border-red-500"
                : "bg-[#0D2420] text-[#9FB7B2] border-[#1B3530]"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {requiresFielder && (
        <div className="mb-4">
          <label className="block text-[#9FB7B2] text-xs font-semibold mb-1">
            Select Fielder
          </label>
          <select
            className="w-full bg-[#0D2420] border border-[#1B3530] text-white rounded-lg p-2 outline-none"
            value={fielderId}
            onChange={(e) => setFielderId(e.target.value)}
          >
            <option value="" disabled>
              Choose Fielder...
            </option>
            {bowlingSquad.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-semibold rounded-lg bg-[#0D2420] text-[#9FB7B2] hover:bg-[#1B3530]"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={requiresFielder && !fielderId}
          className="flex-1 py-3 text-sm font-bold rounded-lg bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Wicket
        </button>
      </div>
    </div>
  );
};
