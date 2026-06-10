import { useEffect, useState, useRef } from "react";

interface FullScreenEventProps {
  eventType: "4" | "6" | "FREE_HIT" | "WICKET" | "DUCK" | "GOLDEN_DUCK" | null;
  onComplete: () => void;
}

export const FullScreenEvent = ({
  eventType,
  onComplete,
}: FullScreenEventProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<"DUCK" | "WICKET" | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (eventType) {
      setIsVisible(true);

      // Handle 2-Step Animation (Duck -> Out)
      if (eventType === "DUCK" || eventType === "GOLDEN_DUCK") {
        setPhase("DUCK");

        // Transition to "OUT" after 1.5s
        const phaseTimer = setTimeout(() => {
          setPhase("WICKET");
        }, 1500);

        // Hide entirely after 3s
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onCompleteRef.current();
          }, 500);
        }, 3000);

        return () => {
          clearTimeout(phaseTimer);
          clearTimeout(hideTimer);
        };
      } else {
        // Standard 1-Step Animation (4, 6, Free Hit, standard Wicket)
        setPhase(null);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onCompleteRef.current();
          }, 500);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [eventType]);

  if (!eventType && !isVisible) return null;

  // Determine exactly what text to show based on phase
  const isWicketPhase = eventType === "WICKET" || phase === "WICKET";
  const isDuckPhase = phase === "DUCK" && eventType === "DUCK";
  const isGoldenDuckPhase = phase === "DUCK" && eventType === "GOLDEN_DUCK";

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ${
        isVisible
          ? "opacity-100 scale-100 bg-black/40 backdrop-blur-sm"
          : "opacity-0 scale-50"
      }`}
    >
      {eventType === "FREE_HIT" && (
        <div className="mb-4 animate-bounce">
          <span className="text-4xl md:text-6xl font-black italic tracking-widest text-warning drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
            FREE HIT!
          </span>
        </div>
      )}

      <div className="transform transition-all animate-bounce flex items-center justify-center text-center">
        {eventType === "4" && (
          <span className="text-7xl md:text-[130px] leading-none font-black italic tracking-tighter text-blue-500 drop-shadow-[0_10px_30px_rgba(59,130,246,0.6)]">
            FOUR! 🎉
          </span>
        )}
        {eventType === "6" && (
          <span className="text-7xl md:text-[130px] leading-none font-black italic tracking-tighter text-orange-500 drop-shadow-[0_10px_30px_rgba(249,115,22,0.6)]">
            SIX! 🚀
          </span>
        )}

        {isWicketPhase && (
          <span className="text-7xl md:text-[130px] leading-none font-black italic tracking-tighter text-destructive drop-shadow-[0_10px_30px_rgba(220,38,38,0.8)]">
            OUT! 💥
          </span>
        )}

        {isDuckPhase && (
          <span className="text-7xl md:text-[100px] leading-none font-black italic tracking-tighter text-gray-300 drop-shadow-[0_10px_30px_rgba(156,163,175,0.6)]">
            DUCK! 🦆
          </span>
        )}

        {isGoldenDuckPhase && (
          <span className="text-6xl md:text-[100px] leading-none font-black italic tracking-tighter text-yellow-400 drop-shadow-[0_10px_40px_rgba(250,204,21,0.8)]">
            GOLDEN DUCK! 🦆✨
          </span>
        )}
      </div>
    </div>
  );
};
