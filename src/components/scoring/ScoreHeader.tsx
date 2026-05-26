interface ScoreHeaderProps {
  battingTeam: string;
  score: number;
  wickets: number;
  overs: number;
}

export default function ScoreHeader({
  battingTeam,
  score,
  wickets,
  overs,
}: ScoreHeaderProps) {
  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-xs font-bold border border-[#0FAF9A]/30 uppercase">
            {battingTeam ? battingTeam.substring(0, 3) : "TBA"}
          </div>
          <div>
            <div className="text-[#9FB7B2] text-xs font-medium mb-0.5">
              {battingTeam || "Batting Team"}
            </div>
            <div className="text-3xl font-bold text-[#F4FFFD] leading-none">
              {score}
              <span className="text-lg text-[#9FB7B2] font-semibold">
                /{wickets}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#9FB7B2] text-xs font-medium mb-0.5">
            {overs} ov
          </div>
          <div className="text-[#19F0C1] font-bold text-sm tracking-wide">
            CRR: {overs > 0 ? (score / Math.floor(overs)).toFixed(2) : "0.00"}
          </div>
        </div>
      </div>

      {/* Target & Progress (Reset for 1st Innings) */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-[#9FB7B2]">1st Innings</span>
          <span className="text-[#19F0C1]">In Progress</span>
        </div>
        <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full w-[0%]"></div>
        </div>
      </div>
    </div>
  );
}
