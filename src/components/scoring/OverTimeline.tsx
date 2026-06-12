import { useEffect, useRef } from "react";

interface OverTimelineProps {
  recentBalls: string[];
}

export default function OverTimeline({ recentBalls }: OverTimelineProps) {
  const displayBalls = (recentBalls || []).slice(-15);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // 🔥 FIX 1: Tiny timeout ensures the DOM actually paints the new ball before scrolling
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [recentBalls]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-lg w-full mt-5 mb-1 animate-fade-in">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3 px-1">
        This Over / Recent
      </div>
      <div
        ref={scrollRef}
        // 🔥 FIX 2: Added `py-3` and `gap-2.5` so the scaled-up active ball NEVER gets its top/bottom clipped!
        className="flex gap-2.5 items-center overflow-x-auto no-scrollbar min-h-[70px] px-2 py-3 scroll-smooth"
      >
        {displayBalls.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">
            Waiting for first ball...
          </span>
        ) : (
          displayBalls.map((b, idx) => {
            const bSafe = b || "";
            let text = bSafe;
            if (bSafe === "0") text = "•";

            const isWicket = bSafe.endsWith("W");
            const isWideOrNoBall = bSafe.includes("WD") || bSafe.includes("NB");

            let bgColor = "bg-transparent text-foreground border border-border";
            let customStyle = {};

            // 🔥 FIX 3: Dynamic text sizing + tracking so "1WD W" fits perfectly without wrapping
            let textSize =
              bSafe.length > 2
                ? "text-[11px] tracking-tighter"
                : "text-sm tracking-tight";

            if (isWicket && isWideOrNoBall) {
              bgColor = "text-white border-none shadow-sm font-black";
              customStyle = {
                background:
                  "linear-gradient(135deg, var(--warning) 50%, var(--destructive) 50%)",
              };
            } else if (isWicket) {
              bgColor = "bg-destructive text-white border-none shadow-sm";
            } else if (isWideOrNoBall) {
              bgColor =
                "bg-warning text-white border-none shadow-sm font-black";
            } else if (bSafe === "4" || bSafe === "6") {
              bgColor =
                "bg-primary text-primary-foreground border-none shadow-sm font-black";
            }

            const isLatest = idx === displayBalls.length - 1;

            return (
              <div
                key={idx}
                // 🔥 FIX 4: Added `whitespace-nowrap` and `z-10` so long text never breaks to two lines and the active ring sits on top
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 leading-none whitespace-nowrap ${textSize} ${bgColor} ${
                  isLatest
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 z-10"
                    : "opacity-80"
                }`}
                style={customStyle}
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
