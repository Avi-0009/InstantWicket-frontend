export default function ScoreHeader() {
  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-xs font-bold border border-[#0FAF9A]/30">
            RCB
          </div>
          <div>
            <div className="text-[#9FB7B2] text-xs font-medium mb-0.5">
              Royal Challengers
            </div>
            <div className="text-3xl font-bold text-[#F4FFFD] leading-none">
              186
              <span className="text-lg text-[#9FB7B2] font-semibold">/4</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#9FB7B2] text-xs font-medium mb-0.5">
            18.3 ov
          </div>
          <div className="text-[#19F0C1] font-bold text-sm tracking-wide">
            CRR: 10.1
          </div>
        </div>
      </div>

      {/* Target & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-[#9FB7B2]">Target: 201</span>
          <span className="text-[#19F0C1]">Need 15 runs</span>
        </div>
        <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full w-[88%]"></div>
        </div>
        <div className="flex justify-between text-[11px] font-medium text-[#9FB7B2]">
          <span>RRR: 5.4</span>
          <span>9 balls left</span>
        </div>
      </div>
    </div>
  );
}
