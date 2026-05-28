import { useEffect, useState } from "react";
import { Trophy, Flame, ShieldAlert, Target } from "lucide-react";

interface FullScreenEventProps {
  eventType: "4" | "6" | "FREE_HIT" | "WICKET" | null;
  onComplete: () => void;
}

export function FullScreenEvent({
  eventType,
  onComplete,
}: FullScreenEventProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (eventType) {
      setIsVisible(true);
      // Auto-hide the animation after 2 seconds!
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade-out to finish before unmounting
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [eventType, onComplete]);

  if (!eventType && !isVisible) return null;

  // Custom configurations for each event type
  const eventConfig = {
    "4": {
      text: "FOUR!",
      color: "text-blue-400",
      bg: "bg-blue-900/40",
      border: "border-blue-500",
      shadow: "shadow-[0_0_100px_rgba(59,130,246,0.6)]",
      icon: (
        <Target className="w-16 h-16 mb-4 text-blue-400 animate-spin-slow" />
      ),
    },
    "6": {
      text: "SIX!",
      color: "text-purple-400",
      bg: "bg-purple-900/40",
      border: "border-purple-500",
      shadow: "shadow-[0_0_100px_rgba(168,85,247,0.6)]",
      icon: (
        <Trophy className="w-20 h-20 mb-4 text-purple-400 animate-bounce" />
      ),
    },
    WICKET: {
      text: "WICKET!",
      color: "text-red-500",
      bg: "bg-red-950/80",
      border: "border-red-600",
      shadow: "shadow-[0_0_100px_rgba(239,68,68,0.8)]",
      icon: <Flame className="w-20 h-20 mb-4 text-red-500 animate-pulse" />,
    },
    FREE_HIT: {
      text: "FREE HIT!",
      color: "text-yellow-400",
      bg: "bg-yellow-900/40",
      border: "border-yellow-500",
      shadow: "shadow-[0_0_100px_rgba(250,204,21,0.6)]",
      icon: (
        <ShieldAlert className="w-20 h-20 mb-4 text-yellow-400 animate-pulse" />
      ),
    },
  };

  const config = eventType ? eventConfig[eventType] : eventConfig["4"];

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/60 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex flex-col items-center justify-center p-12 rounded-full border-4 ${config.bg} ${config.border} ${config.shadow} transition-transform duration-500 ${
          isVisible ? "scale-100 rotate-0" : "scale-50 -rotate-12"
        }`}
      >
        {config.icon}
        <h1
          className={`text-6xl md:text-8xl font-black italic tracking-tighter ${config.color} drop-shadow-2xl uppercase`}
        >
          {config.text}
        </h1>
      </div>
    </div>
  );
}
