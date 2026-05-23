interface PlayerStatsProps {
  striker: string;
  nonStriker: string;
  bowler: string;
}

export default function PlayerStats({
  striker,
  nonStriker,
  bowler,
}: PlayerStatsProps) {
  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Striker */}
        <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50">
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Striker
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">
            {striker || "Player 1"}{" "}
            <span className="text-lg text-[#0FAF9A] leading-none">*</span>
          </div>
          <div className="text-xs text-[#0FAF9A] font-medium mt-0.5">0 (0)</div>
        </div>

        {/* Non-Striker */}
        <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50">
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Non-Striker
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">
            {nonStriker || "Player 2"}
          </div>
          <div className="text-xs text-[#0FAF9A] font-medium mt-0.5">0 (0)</div>
        </div>
      </div>

      {/* Bowler */}
      <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50 flex justify-between items-center">
        <div>
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Bowler
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">
            {bowler || "Current Bowler"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#0FAF9A] font-bold text-sm">0/0</div>
          <div className="text-[11px] text-[#9FB7B2] font-medium">0.0 ov</div>
        </div>
      </div>
    </div>
  );
}
