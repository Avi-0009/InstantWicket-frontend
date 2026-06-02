import { useState } from "react";
import CustomDropdown from "./CustomDropdown";
import { UserMinus, X } from "lucide-react";

export interface Player {
  id: string;
  name: string;
}

interface WicketFormProps {
  availableFielders: Player[];
  onSubmit: (
    wicketType: string,
    outBatterRole: "striker" | "non_striker",
    fielderId: string | null,
    runsCompleted: number, // 🔥 Added this
  ) => void;
  onCancel: () => void;
  isSoloBattingActive?: boolean;
  modifier: "WD" | "NB" | null; // 🔥 Pass modifiers to enforce rules
  isFreeHit: boolean; // 🔥 Pass Free Hit state
}

const WICKET_TYPES = [
  {
    id: "bowled",
    label: "Bowled",
    needsFielder: false,
    canOutNonStriker: false,
    validOnWD: false,
    validOnFreeHit: false,
  },
  {
    id: "caught",
    label: "Caught",
    needsFielder: true,
    canOutNonStriker: false,
    validOnWD: false,
    validOnFreeHit: false,
  },
  {
    id: "run_out",
    label: "Run Out",
    needsFielder: true,
    canOutNonStriker: true,
    validOnWD: true,
    validOnFreeHit: true,
  },
  {
    id: "lbw",
    label: "LBW",
    needsFielder: false,
    canOutNonStriker: false,
    validOnWD: false,
    validOnFreeHit: false,
  },
  {
    id: "stumped",
    label: "Stumped",
    needsFielder: true,
    canOutNonStriker: false,
    validOnWD: true,
    validOnFreeHit: false,
  },
  {
    id: "hit_wicket",
    label: "Hit Wicket",
    needsFielder: false,
    canOutNonStriker: false,
    validOnWD: true,
    validOnFreeHit: false,
  },
];

export const WicketForm = ({
  availableFielders,
  onSubmit,
  onCancel,
  isSoloBattingActive = false,
  modifier,
  isFreeHit,
}: WicketFormProps) => {
  const [wicketType, setWicketType] = useState<string>("");
  const [outBatter, setOutBatter] = useState<"striker" | "non_striker">(
    "striker",
  );
  const [fielderId, setFielderId] = useState<string>("");
  const [runsCompleted, setRunsCompleted] = useState<number>(0);

  const selectedTypeConfig = WICKET_TYPES.find((w) => w.id === wicketType);
  const needsFielder = selectedTypeConfig?.needsFielder;
  const canOutNonStriker = selectedTypeConfig?.canOutNonStriker;

  const handleSubmit = () => {
    if (!wicketType) return;
    if (needsFielder && !fielderId) return;

    // If Solo Batting is active, it must ALWAYS be the striker who gets out
    const finalRole = isSoloBattingActive ? "striker" : outBatter;

    onSubmit(
      wicketType,
      finalRole,
      needsFielder ? fielderId : null,
      runsCompleted,
    );
  };

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-3xl p-5 animate-fade-in text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-destructive font-black text-lg uppercase tracking-wider">
          <UserMinus className="w-5 h-5" />
          Dismissal
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 bg-background border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. Select Wicket Type */}
        <div>
          <label className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest mb-2 block">
            How out?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WICKET_TYPES.map((type) => {
              // 🔥 CRICKET RULE ENFORCEMENT
              const isInvalidOnFreeHit =
                (isFreeHit || modifier === "NB") && !type.validOnFreeHit;
              const isInvalidOnWide = modifier === "WD" && !type.validOnWD;
              const isDisabled = isInvalidOnFreeHit || isInvalidOnWide;

              return (
                <button
                  key={type.id}
                  disabled={isDisabled}
                  onClick={() => {
                    setWicketType(type.id);
                    setFielderId("");
                    setOutBatter("striker");
                    setRunsCompleted(0);
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    isDisabled
                      ? "bg-background border-border/50 text-muted-foreground/30 opacity-40 blur-[0.5px] cursor-not-allowed" // Blurred and disabled!
                      : wicketType === type.id
                        ? "bg-destructive text-background border-destructive shadow-md scale-[0.98]"
                        : "bg-background border-border text-foreground hover:border-destructive/50"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Run Out Runs Completed */}
        {wicketType === "run_out" && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <label className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest mb-2 block">
              Runs completed before wicket?
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((run) => (
                <button
                  key={run}
                  onClick={() => setRunsCompleted(run)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${
                    runsCompleted === run
                      ? "bg-destructive text-background border-destructive"
                      : "bg-background border-border text-foreground hover:border-destructive/50"
                  }`}
                >
                  {run === 0 ? "Dot (0)" : run}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Select Who is Out (Only for Run Outs, Hidden during Solo Batting) */}
        {wicketType && canOutNonStriker && !isSoloBattingActive && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <label className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest mb-2 block">
              Who was dismissed?
            </label>
            <div className="flex gap-2 p-1 bg-background border border-border rounded-xl">
              <button
                onClick={() => setOutBatter("striker")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  outBatter === "striker"
                    ? "bg-destructive/20 text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Striker
              </button>
              <button
                onClick={() => setOutBatter("non_striker")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  outBatter === "non_striker"
                    ? "bg-destructive/20 text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Non-Striker
              </button>
            </div>
          </div>
        )}

        {/* 4. Select Fielder (If applicable) */}
        {wicketType && needsFielder && (
          <div className="animate-in slide-in-from-top-2 duration-200 relative z-50">
            <label className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest mb-2 block">
              Fielder / Assistant
            </label>
            <CustomDropdown
              placeholder="Choose Fielder..."
              value={fielderId}
              options={availableFielders.map((f) => ({
                id: f.id,
                name: f.name,
              }))}
              onChange={(val) => setFielderId(val)}
              direction="up"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!wicketType || (needsFielder && !fielderId)}
          className="w-full bg-destructive text-background font-black py-4 rounded-xl text-sm tracking-wider uppercase transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          Confirm Wicket
        </button>
      </div>
    </div>
  );
};
