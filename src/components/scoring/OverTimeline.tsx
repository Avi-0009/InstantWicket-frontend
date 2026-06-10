import { useEffect, useRef } from "react";

interface OverTimelineProps {
  recentBalls: string[];
}

export default function OverTimeline({ recentBalls }: OverTimelineProps) {
  // Ensure we only ever show the most recent 15 balls
  const displayBalls = (recentBalls || []).slice(-15);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest ball on the right
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [recentBalls]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-lg w-full mt-5 mb-1 animate-fade-in">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3 px-1">
        This Over / Recent
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 items-center overflow-x-auto no-scrollbar min-h-15 px-2 pb-1 scroll-smooth"
      >
        {displayBalls.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">
            Waiting for first ball...
          </span>
        ) : (
          displayBalls.map((b, idx) => {
            let text = b;
            if (b === "0") text = "•";

            // Default style for normal runs (1, 2, 3) and dots
            let bgColor = "bg-transparent text-foreground border border-border";

            // 🔴 Wickets (Strict check so "1wd" doesn't trigger red)
            if (b.includes("W") && !b.includes("wd")) {
              bgColor =
                "bg-destructive text-white border-destructive shadow-sm";
            }
            // 🟡 Extras (Wides, No Balls, Byes, Leg Byes)
            else if (
              b.includes("wd") ||
              b.includes("nb") ||
              b.includes("b") ||
              b.includes("lb")
            ) {
              bgColor =
                "bg-warning text-warning-foreground border-warning font-black shadow-sm";
            }
            // 🟢 Boundaries (4, 6)
            else if (b === "4" || b === "6") {
              bgColor =
                "bg-primary text-card border-primary font-black shadow-sm";
            }

            // Identify the ball just delivered
            const isLatest = idx === displayBalls.length - 1;

            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all shrink-0 ${bgColor} ${
                  isLatest
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                    : "opacity-80"
                }`}
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
