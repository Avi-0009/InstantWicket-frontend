interface OverTimelineProps {
  thisOver: string[];
}

export default function OverTimeline({ thisOver }: OverTimelineProps) {
  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-lg">
      <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-3">
        This Over
      </div>
      <div className="flex gap-2 items-center overflow-x-auto no-scrollbar min-h-9">
        {thisOver.length === 0 ? (
          <span className="text-xs text-[#9FB7B2] italic">0 balls (Empty)</span>
        ) : (
          thisOver.map((b, idx) => {
            const isBoundary = b.includes("4") || b.includes("6");
            const isWicket = b.includes("W") && !b.includes("Wd");

            return (
              <div
                key={idx}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm shrink-0
                  ${isBoundary ? "bg-[#0FAF9A] text-background" : ""}
                  ${isWicket ? "bg-[#FF6B6B] text-[#F4FFFD]" : ""}
                  ${!isBoundary && !isWicket ? "bg-[#0D2420] text-[#F4FFFD] border border-[#1B3530]" : ""}
                `}
              >
                {b === "0" ? "•" : b}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
