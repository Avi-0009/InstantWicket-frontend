import { Undo2, UserMinus, ChevronRight } from "lucide-react";

export default function ScoringPad() {
  return (
    <div className="space-y-4">
      {/* Runs Section */}
      <div>
        <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-2 px-1">
          Runs
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button className="h-14 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#F4FFFD] text-lg font-bold hover:bg-[#1B3530] transition-colors">
            •
          </button>
          <button className="h-14 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#F4FFFD] text-lg font-bold hover:bg-[#1B3530] transition-colors">
            1
          </button>
          <button className="h-14 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#F4FFFD] text-lg font-bold hover:bg-[#1B3530] transition-colors">
            2
          </button>
          <button className="h-14 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#F4FFFD] text-lg font-bold hover:bg-[#1B3530] transition-colors">
            3
          </button>
          <button className="h-14 bg-[#0D2420] border border-[#0FAF9A] rounded-xl text-[#0FAF9A] text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-[#0FAF9A]/10 transition-colors">
            4
          </button>
          <button className="h-14 bg-[#0D2420] border border-[#0FAF9A] rounded-xl text-[#0FAF9A] text-lg font-bold shadow-[0_0_15px_rgba(15,175,154,0.15)] hover:bg-[#0FAF9A]/10 transition-colors">
            6
          </button>
        </div>
      </div>

      {/* Extras & Wickets */}
      <div>
        <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-2 px-1">
          Extras & Wickets
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button className="h-12 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-semibold hover:bg-[#1B3530] transition-colors">
            Wide
          </button>
          <button className="h-12 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-semibold hover:bg-[#1B3530] transition-colors">
            No Ball
          </button>
          <button className="h-12 bg-[#0D2420] border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-semibold hover:bg-[#1B3530] transition-colors">
            Byes
          </button>
          <button className="h-12 bg-[#3A1616] border border-[#FF6B6B] rounded-xl text-[#FF6B6B] text-xs font-bold shadow-[0_0_15px_rgba(255,107,107,0.15)] hover:bg-[#4A1D1D] transition-colors">
            Wicket
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          <UserMinus className="w-3.5 h-3.5 text-[#F59E0B]" /> Retire
        </button>
        <button className="h-11 bg-transparent border border-[#1B3530] rounded-xl text-[#9FB7B2] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#0D2420] transition-colors">
          Summary <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
