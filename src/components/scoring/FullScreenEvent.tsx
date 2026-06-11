import { useEffect, useState, useRef } from "react";

interface FullScreenEventProps {
  eventType: "4" | "6" | "FREE_HIT" | "WICKET" | null;
  onComplete: () => void;
}

export const FullScreenEvent = ({
  eventType,
  onComplete,
}: FullScreenEventProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (eventType) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onCompleteRef.current();
        }, 500);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [eventType]);

  if (!eventType && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
      }`}
    >
      {eventType === "FREE_HIT" && (
        <div className="mb-4 animate-bounce">
          <span className="text-4xl md:text-6xl font-black italic tracking-widest text-warning drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
            FREE HIT!
          </span>
        </div>
      )}

      <div className="transform transition-all animate-bounce">
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
        {eventType === "WICKET" && (
          <span className="text-7xl md:text-[130px] leading-none font-black italic tracking-tighter text-destructive drop-shadow-[0_10px_30px_rgba(220,38,38,0.6)]">
            OUT! 💥
          </span>
        )}
      </div>
    </div>
  );
};
