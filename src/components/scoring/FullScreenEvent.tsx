import React, { useEffect } from "react";

interface FullScreenEventProps {
  eventType: "4" | "6" | "FREE_HIT" | "WICKET" | null;
  onComplete: () => void;
}

export const FullScreenEvent: React.FC<FullScreenEventProps> = ({
  eventType,
  onComplete,
}) => {
  // Auto-dismiss the popup after 2 seconds
  useEffect(() => {
    if (eventType) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [eventType, onComplete]);

  if (!eventType) return null;

  const config = {
    "4": { text: "FOUR!", bg: "bg-blue-600/95", textColor: "text-white" },
    "6": { text: "SIX!", bg: "bg-purple-600/95", textColor: "text-white" },
    FREE_HIT: {
      text: "FREE HIT!",
      bg: "bg-yellow-500/95",
      textColor: "text-black",
    },
    WICKET: { text: "OUT!", bg: "bg-red-600/95", textColor: "text-white" },
  };

  const data = config[eventType];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${data.bg} backdrop-blur-sm transition-all duration-300 animate-in fade-in`}
    >
      <h1
        className={`text-7xl md:text-9xl font-black italic ${data.textColor} tracking-tighter drop-shadow-2xl scale-up-center animate-bounce`}
      >
        {data.text}
      </h1>
    </div>
  );
};
