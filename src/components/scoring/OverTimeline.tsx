interface OverTimelineProps {
  recentBalls: string[];
}

export default function OverTimeline({ recentBalls }: OverTimelineProps) {
  // Ensure we only ever show the most recent 15 balls
  const displayBalls = (recentBalls || []).slice(-15);

  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-lg w-full mt-5 mb-1 animate-fade-in">
      <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-3 px-1">
        This Over / Recent
      </div>
      <div className="flex gap-2 items-center overflow-x-auto no-scrollbar min-h-11 px-1 pb-1">
        {displayBalls.length === 0 ? (
          <span className="text-xs text-[#9FB7B2] italic">
            Waiting for first ball...
          </span>
        ) : (
          displayBalls.map((b, idx) => {
            let text = b;
            if (b === "0") text = "•";

            // Default style for normal runs (1, 2, 3) and dots
            let bgColor =
              "bg-transparent text-[#F4FFFD] border border-[#1B3530]";

            // 🔴 Wickets (Strict check so "1wd" doesn't trigger red)
            if (b.includes("W") && !b.includes("wd")) {
              bgColor =
                "bg-destructive text-white border-destructive shadow-sm";
            }
            // 🟡 Extras (Wides, No Balls like "1wd", "7nb", etc.)
            else if (b.includes("wd") || b.includes("nb")) {
              bgColor =
                "bg-warning text-warning-foreground border-warning font-black shadow-sm";
            }
            // 🟢 Boundaries (4, 6)
            else if (b === "4" || b === "6") {
              bgColor =
                "bg-[#0FAF9A] text-[#0B1F1B] border-[#0FAF9A] font-black shadow-sm";
            }

            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all shrink-0 ${bgColor}`}
              >
                {text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
