import { useState } from "react";
import { type Player } from "./PlayerSelectModal";
import { UserMinus } from "lucide-react";

interface WicketFormProps {
  bowlingSquad: Player[];
  onSubmit: (
    wicketType: string,
    outBatter: "striker" | "non_striker",
    fielderId: string | null,
  ) => void;
  onCancel: () => void;
}

const WICKET_TYPES = [
  { id: "bowled", label: "Bowled" },
  { id: "caught", label: "Caught" },
  { id: "run_out", label: "Run Out" },
  { id: "lbw", label: "LBW" },
  { id: "stumped", label: "Stumped" },
  { id: "hit_wicket", label: "Hit Wicket" },
];

export const WicketForm = ({
  bowlingSquad,
  onSubmit,
  onCancel,
}: WicketFormProps) => {
  const [wicketType, setWicketType] = useState<string>("bowled");
  const [outBatter, setOutBatter] = useState<"striker" | "non_striker">(
    "striker",
  );
  const [fielderId, setFielderId] = useState<string>("");

  const needsFielder = ["caught", "run_out", "stumped"].includes(wicketType);

  const handleSubmit = () => {
    onSubmit(
      wicketType,
      outBatter,
      needsFielder && fielderId ? fielderId : null,
    );
  };

  return (
    <div className="bg-card border border-destructive/50 rounded-2xl p-5 shadow-lg animate-fade-in">
      <div className="flex items-center gap-2 text-destructive mb-4 font-bold">
        <UserMinus className="w-5 h-5" />
        <h3 className="text-lg">Wicket Details</h3>
      </div>

      <div className="space-y-4">
        {/* 1. Select Wicket Type */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 block">
            How out?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {WICKET_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setWicketType(type.id)}
                className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                  wicketType === type.id
                    ? "bg-destructive text-background border-destructive shadow-[0_0_10px_rgba(255,107,107,0.3)]"
                    : "bg-background border-border text-foreground hover:bg-border"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Who is Out (Crucial for Run Outs) */}
        {wicketType === "run_out" && (
          <div className="animate-fade-in">
            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 block">
              Who is out?
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOutBatter("striker")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                  outBatter === "striker"
                    ? "bg-primary text-background border-primary"
                    : "bg-background border-border"
                }`}
              >
                Striker
              </button>
              <button
                onClick={() => setOutBatter("non_striker")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                  outBatter === "non_striker"
                    ? "bg-primary text-background border-primary"
                    : "bg-background border-border"
                }`}
              >
                Non-Striker
              </button>
            </div>
          </div>
        )}

        {/* 3. Select Fielder (If applicable) */}
        {needsFielder && (
          <div className="animate-fade-in">
            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 block">
              Fielder / Assistant
            </label>
            <select
              value={fielderId}
              onChange={(e) => setFielderId(e.target.value)}
              className="w-full bg-background border border-border text-foreground rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">-- Select Fielder --</option>
              {bowlingSquad.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-background border border-border text-foreground rounded-xl font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={needsFielder && !fielderId} // Force fielder selection if needed
            className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-background rounded-xl font-bold text-sm disabled:opacity-50"
          >
            Confirm Wicket
          </button>
        </div>
      </div>
    </div>
  );
};
