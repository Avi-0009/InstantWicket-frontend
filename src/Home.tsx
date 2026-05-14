import {
  Trophy,
  Home as HomeIcon,
  History,
  BarChart2,
  Users,
  Activity,
  TrendingUp,
  Zap,
  Play,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#061311] text-[#F4FFFD] font-sans pb-20 md:pb-0">
      {/* Top Navbar - Hidden on small mobile, visible on tablet/desktop */}
      <nav className="hidden md:flex sticky top-0 z-50 bg-[#0b1f1b]/85 backdrop-blur-md border-b border-[#1B3530] px-5 h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#0FAF9A]" />
          <span className="text-[15px] font-bold bg-gradient-to-br from-[#0FAF9A] to-[#19F0C1] text-transparent bg-clip-text">
            InstantWicket
          </span>
        </div>

        <div className="flex gap-1">
          <div className="px-3 py-1.5 rounded-lg text-[13px] flex items-center gap-1.5 bg-[#0FAF9A]/20 text-[#0FAF9A]">
            <HomeIcon className="w-4 h-4" /> Dashboard
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[13px] text-[#9FB7B2] flex items-center gap-1.5 hover:bg-[#0FAF9A]/10">
            <Trophy className="w-4 h-4" /> New Match
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[13px] text-[#9FB7B2] flex items-center gap-1.5 hover:bg-[#0FAF9A]/10">
            <History className="w-4 h-4" /> History
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[13px] text-[#9FB7B2] flex items-center gap-1.5 hover:bg-[#0FAF9A]/10">
            <BarChart2 className="w-4 h-4" /> Stats
          </div>
          <div className="px-3 py-1.5 rounded-lg text-[13px] text-[#9FB7B2] flex items-center gap-1.5 hover:bg-[#0FAF9A]/10">
            <Users className="w-4 h-4" /> Players
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-xs font-semibold">
          RX
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#F4FFFD]">Dashboard</h1>
            <p className="text-[13px] text-[#9FB7B2]">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <button className="bg-[#0FAF9A] text-[#061311] border-none rounded-lg px-5 py-2.5 text-sm font-semibold flex items-center gap-2 w-full md:w-auto justify-center hover:bg-[#19F0C1] transition-colors">
            <Trophy className="w-4 h-4" /> Start New Match
          </button>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#0b1f1b]/70 border border-[#1b3530]/50 rounded-xl p-3.5 text-center">
            <div className="w-9 h-9 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold">148</div>
            <div className="text-[11px] text-[#9FB7B2]">Total Matches</div>
            <div className="text-[10px] text-[#22C55E] mt-1">+12 this week</div>
          </div>

          <div className="bg-[#0b1f1b]/70 border border-[#1b3530]/50 rounded-xl p-3.5 text-center">
            <div className="w-9 h-9 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] flex items-center justify-center mx-auto mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold">3</div>
            <div className="text-[11px] text-[#9FB7B2]">Live Now</div>
          </div>

          <div className="bg-[#0b1f1b]/70 border border-[#1b3530]/50 rounded-xl p-3.5 text-center">
            <div className="w-9 h-9 rounded-full bg-[#19F0C1]/15 text-[#19F0C1] flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold">24,810</div>
            <div className="text-[11px] text-[#9FB7B2]">Total Runs</div>
          </div>

          <div className="bg-[#0b1f1b]/70 border border-[#1b3530]/50 rounded-xl p-3.5 text-center">
            <div className="w-9 h-9 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-[22px] font-bold">87</div>
            <div className="text-[11px] text-[#9FB7B2]">Active Players</div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0FAF9A]" /> Matches
          </h2>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <div className="px-3 py-1.5 rounded-lg text-xs bg-[#0FAF9A]/20 text-[#0FAF9A] whitespace-nowrap">
              All
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs text-[#9FB7B2] whitespace-nowrap">
              Live
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs text-[#9FB7B2] whitespace-nowrap">
              Upcoming
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs text-[#9FB7B2] whitespace-nowrap">
              Recent
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#9FB7B2] uppercase tracking-[0.06em] mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>{" "}
          Live Matches
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Match Card 1 */}
          <div className="bg-gradient-to-br from-[#0B1F1B] to-[#0D2420] border border-[#1B3530] rounded-[14px] p-4 relative">
            <div className="absolute top-3 right-3 bg-[#FF6B6B]/15 text-[#FF6B6B] px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>
              LIVE
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-[10px] font-bold">
                RCB
              </div>
              <div>
                <div className="font-semibold text-sm">Royal Challengers</div>
                <div className="text-2xl font-bold text-[#0FAF9A]">
                  186<span className="text-base text-[#9FB7B2]">/4</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-[#9FB7B2]">18.3 ov</div>
                <div className="text-xs text-[#19F0C1]">CRR: 10.1</div>
              </div>
            </div>

            <div className="bg-[#0D2420] rounded-lg p-2.5 mb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#9FB7B2]">Target: 201</span>
                <span className="text-[#5FFFD2] font-semibold">
                  Need 15 runs
                </span>
              </div>
              <div className="h-1.5 bg-[#1B3530] rounded-full overflow-hidden my-1.5">
                <div className="h-full bg-gradient-to-r from-[#0FAF9A] to-[#19F0C1] rounded-full w-[88%]"></div>
              </div>
              <div className="text-[#9FB7B2]">RRR: 5.4 | 9 balls left</div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <div className="text-[#9FB7B2]">Striker</div>
                <div className="font-medium">V. Kohli</div>
              </div>
              <div>
                <div className="text-[#9FB7B2]">Bowler</div>
                <div className="font-medium">B. Kumar</div>
              </div>
              <button className="bg-transparent border border-[#1B3530] rounded-lg px-3 py-1.5 text-[#9FB7B2] flex items-center gap-1 hover:text-[#0FAF9A] hover:border-[#0FAF9A] transition-colors">
                <Play className="w-3.5 h-3.5" /> Score
              </button>
            </div>
          </div>

          {/* Match Card 2 */}
          <div className="bg-gradient-to-br from-[#0B1F1B] to-[#0D2420] border border-[#1B3530] rounded-[14px] p-4 relative">
            <div className="absolute top-3 right-3 bg-[#FF6B6B]/15 text-[#FF6B6B] px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#FF6B6B] animate-pulse inline-block"></span>
              LIVE
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#19F0C1]/15 text-[#19F0C1] flex items-center justify-center text-[10px] font-bold">
                MI
              </div>
              <div>
                <div className="font-semibold text-sm">Mumbai Indians</div>
                <div className="text-2xl font-bold text-[#0FAF9A]">
                  143<span className="text-base text-[#9FB7B2]">/6</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-[#9FB7B2]">16.0 ov</div>
                <div className="text-xs text-[#19F0C1]">CRR: 8.9</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-8">
              <div>
                <div className="text-[#9FB7B2]">Striker</div>
                <div className="font-medium">R. Sharma</div>
              </div>
              <div>
                <div className="text-[#9FB7B2]">Bowler</div>
                <div className="font-medium">J. Bumrah</div>
              </div>
              <button className="bg-transparent border border-[#1B3530] rounded-lg px-3 py-1.5 text-[#9FB7B2] flex items-center gap-1 hover:text-[#0FAF9A] hover:border-[#0FAF9A] transition-colors">
                <Play className="w-3.5 h-3.5" /> Score
              </button>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="text-xs font-semibold text-[#9FB7B2] uppercase tracking-[0.06em] mb-3">
          Popular Players
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-[14px] p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-sm font-semibold mb-2">
              VK
            </div>
            <div className="text-[13px] font-semibold w-full text-center truncate">
              V. Kohli
            </div>
            <div className="text-[11px] text-[#9FB7B2]">32 matches</div>
            <div className="text-center mt-1.5">
              <span className="text-lg font-bold text-[#0FAF9A]">148</span>
              <div className="text-[10px] text-[#9FB7B2]">SR</div>
            </div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-[14px] p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#19F0C1]/15 text-[#19F0C1] flex items-center justify-center text-sm font-semibold mb-2">
              RS
            </div>
            <div className="text-[13px] font-semibold w-full text-center truncate">
              R. Sharma
            </div>
            <div className="text-[11px] text-[#9FB7B2]">28 matches</div>
            <div className="text-center mt-1.5">
              <span className="text-lg font-bold text-[#0FAF9A]">132</span>
              <div className="text-[10px] text-[#9FB7B2]">SR</div>
            </div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-[14px] p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center text-sm font-semibold mb-2">
              MS
            </div>
            <div className="text-[13px] font-semibold w-full text-center truncate">
              M. Dhoni
            </div>
            <div className="text-[11px] text-[#9FB7B2]">45 matches</div>
            <div className="text-center mt-1.5">
              <span className="text-lg font-bold text-[#0FAF9A]">161</span>
              <div className="text-[10px] text-[#9FB7B2]">SR</div>
            </div>
          </div>

          <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-[14px] p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/15 text-[#FF6B6B] flex items-center justify-center text-sm font-semibold mb-2">
              JB
            </div>
            <div className="text-[13px] font-semibold w-full text-center truncate">
              J. Bumrah
            </div>
            <div className="text-[11px] text-[#9FB7B2]">38 matches</div>
            <div className="text-center mt-1.5">
              <span className="text-lg font-bold text-[#0FAF9A]">6.8</span>
              <div className="text-[10px] text-[#9FB7B2]">Eco</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav - Visible only on mobile */}
      <div className="fixed bottom-0 w-full bg-[#0b1f1b]/95 backdrop-blur-md border-t border-[#1B3530] py-2 flex justify-around md:hidden z-50">
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#0FAF9A]">
          <div className="w-6 h-[3px] bg-[#0FAF9A] rounded-full mb-0.5"></div>
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Match</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <History className="w-5 h-5" />
          <span className="text-[10px]">History</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px]">Stats</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-3 py-1 text-[#9FB7B2] pt-2">
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Players</span>
        </div>
      </div>
    </div>
  );
}
