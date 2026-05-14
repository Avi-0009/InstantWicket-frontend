import { Trophy, Activity, Globe, Zap } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#061311] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-3xl p-8 md:p-12 max-w-md w-full flex flex-col items-center justify-center shadow-2xl">
        {/* Animated Trophy Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#061311] border border-[#1B3530] flex items-center justify-center shadow-[0_0_30px_rgba(15,175,154,0.15)]">
            <Trophy className="w-12 h-12 text-[#F59E0B]" />
          </div>
          {/* Lightning Badge */}
          <div className="absolute top-0 right-0 w-7 h-7 bg-[#FF6B6B] rounded-full flex items-center justify-center border-2 border-[#0B1F1B]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-[#0FAF9A] to-[#19F0C1] text-transparent bg-clip-text mb-2">
          InstantWicket
        </h1>
        <p className="text-[#9FB7B2] text-[15px] mb-8">
          Professional Cricket Scoring
        </p>

        {/* Features List */}
        <div className="flex gap-4 md:gap-6 text-xs font-medium mb-8">
          <div className="flex items-center gap-1.5 text-[#F4FFFD]">
            <Activity className="w-4 h-4 text-[#0FAF9A]" /> Live Scoring
          </div>
          <div className="flex items-center gap-1.5 text-[#F4FFFD]">
            <Globe className="w-4 h-4 text-[#19F0C1]" /> Real-time
          </div>
          <div className="flex items-center gap-1.5 text-[#F4FFFD]">
            <Zap className="w-4 h-4 text-[#F59E0B]" /> Instant Share
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-[240px]">
          <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden mb-3">
            {/* Tailwind arbitrary value for a 2-second fill animation */}
            <div className="h-full bg-gradient-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full w-0 animate-[fillBar_2s_ease-in-out_forwards]"></div>
          </div>
          <p className="text-center text-xs text-[#9FB7B2]">Loading...</p>
        </div>
      </div>

      {/* Add keyframes directly in the component for simplicity, or put in tailwind.config.js */}
      <style>{`
        @keyframes fillBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
