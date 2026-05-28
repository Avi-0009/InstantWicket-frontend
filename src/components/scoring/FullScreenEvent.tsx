import { useEffect, useState, useRef } from "react";

interface FullScreenEventProps {
  eventType: { type: "4" | "6" | "WICKET" | null; isFreeHit: boolean } | null;
  onComplete: () => void;
}

export const FullScreenEvent = ({
  eventType,
  onComplete,
}: FullScreenEventProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Ref prevents the parent component's API polling from resetting the timer
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (eventType && (eventType.type || eventType.isFreeHit)) {
      setIsVisible(true);

      // Auto close after exactly 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(false); // Start CSS fade out

        // Wait 500ms for fade to finish, then clear the state in LiveScoring
        setTimeout(() => {
          onCompleteRef.current();
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [eventType]);

  // Don't render anything if there's no event and it's not visible
  if (!eventType && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-500 pointer-events-none ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-110"
      }`}
    >
      {/* FREE HIT TEXT */}
      {eventType?.isFreeHit && (
        <div className="mb-4 animate-bounce">
          <span className="text-4xl md:text-6xl font-black italic tracking-widest text-[#0FAF9A] drop-shadow-[0_0_20px_rgba(15,175,154,0.6)]">
            FREE HIT!
          </span>
        </div>
      )}

      {/* BOUNDARY / WICKET TEXT */}
      <div className="transform transition-all animate-pulse">
        {eventType?.type === "4" && (
          <span className="text-8xl md:text-[160px] leading-none font-black italic tracking-tighter text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.8)]">
            FOUR
          </span>
        )}
        {eventType?.type === "6" && (
          <span className="text-8xl md:text-[160px] leading-none font-black italic tracking-tighter text-orange-500 drop-shadow-[0_0_50px_rgba(249,115,22,0.8)]">
            SIX!
          </span>
        )}
        {eventType?.type === "WICKET" && (
          <span className="text-8xl md:text-[160px] leading-none font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_50px_rgba(220,38,38,0.8)]">
            OUT!
          </span>
        )}
      </div>
    </div>
  );
};
