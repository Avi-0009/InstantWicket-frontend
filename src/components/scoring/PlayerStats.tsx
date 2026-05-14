export default function PlayerStats() {
  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Striker */}
        <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50">
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Striker
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">V. Kohli</div>
          <div className="text-xs text-[#0FAF9A] font-medium mt-0.5">
            94 (58)
          </div>
        </div>

        {/* Non-Striker */}
        <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50">
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Non-Striker
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">G. Maxwell</div>
          <div className="text-xs text-[#0FAF9A] font-medium mt-0.5">
            38 (22)
          </div>
        </div>
      </div>

      {/* Bowler */}
      <div className="bg-[#0D2420] rounded-xl p-3 border border-[#1B3530]/50 flex justify-between items-center">
        <div>
          <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-1">
            Bowler
          </div>
          <div className="text-sm font-bold text-[#F4FFFD]">B. Kumar</div>
        </div>
        <div className="text-right">
          <div className="text-[#0FAF9A] font-bold text-sm">2/28</div>
          <div className="text-[11px] text-[#9FB7B2] font-medium">3.3 ov</div>
        </div>
      </div>
    </div>
  );
}
