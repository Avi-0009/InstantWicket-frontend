import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  Settings,
  CircleDashed,
  Play,
} from "lucide-react";

const NewMatchPage = () => {
  const navigate = useNavigate();

  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [matchType, setMatchType] = useState("T20");
  const [customOvers, setCustomOvers] = useState("");

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  const [captainA, setCaptainA] = useState("");
  const [captainB, setCaptainB] = useState("");
  const [umpire1, setUmpire1] = useState("");
  const [umpire2, setUmpire2] = useState("");
  const [allowSolo, setAllowSolo] = useState(false);
  const [allowCommon, setAllowCommon] = useState(false);

  // Toss States
  const [isFlipping, setIsFlipping] = useState(false);
  const [draftTossWinner, setDraftTossWinner] = useState<string | null>(null);
  const [matchTossWinner, setMatchTossWinner] = useState<string | null>(null);
  const [matchTossDecision, setMatchTossDecision] = useState<
    "bat" | "bowl" | null
  >(null);

  // Handlers
  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleDraftToss = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setDraftTossWinner(Math.random() > 0.5 ? teamA : teamB);
      setIsFlipping(false);
    }, 1500);
  };

  const handleMatchToss = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setMatchTossWinner(Math.random() > 0.5 ? teamA : teamB);
      setIsFlipping(false);
    }, 1500);
  };

  const handleStartMatch = () => {
    // Here you will eventually send all this data to your Go backend
    console.log("Starting match with data:", {
      matchType,
      teamA,
      teamB,
      captainA,
      draftTossWinner,
      matchTossWinner,
      matchTossDecision,
    });
    navigate("/match/live");
  };

  // --- STEP RENDERERS ---

  const renderStep1 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-[#F4FFFD] flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-[#0FAF9A]" /> Select Match Format
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {["T20", "ODI", "T10", "Custom"].map((type) => (
          <button
            key={type}
            onClick={() => setMatchType(type)}
            className={`p-4 rounded-xl border-2 font-bold transition-all ${
              matchType === type
                ? "bg-[#0FAF9A]/20 border-[#0FAF9A] text-[#0FAF9A]"
                : "bg-[#0B1F1B] border-[#1B3530] text-[#9FB7B2] hover:border-[#0FAF9A]/50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      {matchType === "Custom" && (
        <div className="mt-4">
          <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
            Number of Overs
          </label>
          <input
            type="number"
            value={customOvers}
            onChange={(e) => setCustomOvers(e.target.value)}
            placeholder="e.g. 15"
            className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A] transition-colors"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-[#F4FFFD] flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#0FAF9A]" /> Name Your Teams
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
            Team A Name
          </label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder="e.g. Warriors"
            className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A]"
          />
        </div>
        <div className="flex justify-center py-2 text-[#9FB7B2] font-black italic">
          VS
        </div>
        <div>
          <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
            Team B Name
          </label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder="e.g. Titans"
            className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A]"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-[#F4FFFD] flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-[#0FAF9A]" /> Match Officials & Rules
      </h2>

      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#9FB7B2] block mb-1">
              Captain ({teamA || "Team A"})
            </label>
            <input
              type="text"
              value={captainA}
              onChange={(e) => setCaptainA(e.target.value)}
              className="w-full bg-[#061311] border border-[#1B3530] text-[#F4FFFD] text-sm rounded-lg py-2 px-3 focus:border-[#0FAF9A] outline-none"
              placeholder="Name"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9FB7B2] block mb-1">
              Captain ({teamB || "Team B"})
            </label>
            <input
              type="text"
              value={captainB}
              onChange={(e) => setCaptainB(e.target.value)}
              className="w-full bg-[#061311] border border-[#1B3530] text-[#F4FFFD] text-sm rounded-lg py-2 px-3 focus:border-[#0FAF9A] outline-none"
              placeholder="Name"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#9FB7B2] block mb-1">
              Umpire 1
            </label>
            <input
              type="text"
              value={umpire1}
              onChange={(e) => setUmpire1(e.target.value)}
              className="w-full bg-[#061311] border border-[#1B3530] text-[#F4FFFD] text-sm rounded-lg py-2 px-3 focus:border-[#0FAF9A] outline-none"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9FB7B2] block mb-1">
              Umpire 2
            </label>
            <input
              type="text"
              value={umpire2}
              onChange={(e) => setUmpire2(e.target.value)}
              className="w-full bg-[#061311] border border-[#1B3530] text-[#F4FFFD] text-sm rounded-lg py-2 px-3 focus:border-[#0FAF9A] outline-none"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      {/* Custom Rules Toggles */}
      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-4 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#F4FFFD]">
              Allow Common Players
            </p>
            <p className="text-xs text-[#9FB7B2]">
              Players can field/bat for both teams
            </p>
          </div>
          <button
            onClick={() => setAllowCommon(!allowCommon)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${allowCommon ? "bg-[#0FAF9A]" : "bg-[#1B3530]"}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${allowCommon ? "translate-x-6" : ""}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[#1B3530]">
          <div>
            <p className="text-sm font-bold text-[#F4FFFD]">Solo Player Mode</p>
            <p className="text-xs text-[#9FB7B2]">
              Batsman can play without a non-striker
            </p>
          </div>
          <button
            onClick={() => setAllowSolo(!allowSolo)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${allowSolo ? "bg-[#0FAF9A]" : "bg-[#1B3530]"}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${allowSolo ? "translate-x-6" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fade-in space-y-8 flex flex-col items-center justify-center py-8">
      <h2 className="text-xl font-bold text-[#F4FFFD] text-center">
        Draft Toss
        <span className="block text-sm text-[#9FB7B2] font-normal mt-1">
          Who picks their players first?
        </span>
      </h2>

      {!draftTossWinner ? (
        <button
          onClick={handleDraftToss}
          disabled={isFlipping}
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(15,175,154,0.3)] transition-all ${
            isFlipping
              ? "border-[#0FAF9A] animate-[spin_0.2s_linear_infinite]"
              : "border-[#1B3530] bg-[#0B1F1B] hover:border-[#0FAF9A]/50"
          }`}
        >
          <CircleDashed
            className={`w-12 h-12 ${isFlipping ? "text-[#0FAF9A]" : "text-[#9FB7B2]"}`}
          />
        </button>
      ) : (
        <div className="text-center animate-bounce-in">
          <div className="w-24 h-24 bg-[#0FAF9A]/20 border-2 border-[#0FAF9A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(15,175,154,0.4)]">
            <Trophy className="w-10 h-10 text-[#0FAF9A]" />
          </div>
          <h3 className="text-2xl font-black text-[#F4FFFD]">
            {draftTossWinner}
          </h3>
          <p className="text-[#0FAF9A] font-bold mt-1">Won the draft toss!</p>
          <p className="text-sm text-[#9FB7B2] mt-4 max-w-xs mx-auto">
            (In a future update, you will now select your 11 players per team
            here.)
          </p>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-fade-in space-y-8 flex flex-col items-center justify-center py-8">
      <h2 className="text-xl font-bold text-[#F4FFFD] text-center">
        Match Toss
        <span className="block text-sm text-[#9FB7B2] font-normal mt-1">
          Bat or Bowl?
        </span>
      </h2>

      {!matchTossWinner ? (
        <button
          onClick={handleMatchToss}
          disabled={isFlipping}
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(255,107,107,0.3)] transition-all ${
            isFlipping
              ? "border-[#FF6B6B] animate-[spin_0.2s_linear_infinite]"
              : "border-[#1B3530] bg-[#0B1F1B] hover:border-[#FF6B6B]/50"
          }`}
        >
          <CircleDashed
            className={`w-12 h-12 ${isFlipping ? "text-[#FF6B6B]" : "text-[#9FB7B2]"}`}
          />
        </button>
      ) : (
        <div className="text-center animate-bounce-in w-full">
          <h3 className="text-2xl font-black text-[#F4FFFD] mb-1">
            {matchTossWinner}
          </h3>
          <p className="text-[#9FB7B2] mb-6">won the toss and elected to...</p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMatchTossDecision("bat")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                matchTossDecision === "bat"
                  ? "bg-[#0FAF9A] text-[#061311] border-[#0FAF9A] shadow-[0_0_20px_rgba(15,175,154,0.3)]"
                  : "bg-[#0B1F1B] text-[#9FB7B2] border-[#1B3530]"
              }`}
            >
              BAT
            </button>
            <button
              onClick={() => setMatchTossDecision("bowl")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                matchTossDecision === "bowl"
                  ? "bg-[#FF6B6B] text-[#061311] border-[#FF6B6B] shadow-[0_0_20px_rgba(255,107,107,0.3)]"
                  : "bg-[#0B1F1B] text-[#9FB7B2] border-[#1B3530]"
              }`}
            >
              BOWL
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#061311] font-sans pb-8">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-[#061311]/95 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-[#1B3530]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full text-[#F4FFFD]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#F4FFFD]">Create Match</h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full bg-[#1B3530] overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${idx + 1 === totalSteps ? "bg-[#FF6B6B]" : "bg-[#0FAF9A]"}`}
                style={{ width: step > idx ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-[#9FB7B2] mt-3 uppercase tracking-wider">
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </main>

      {/* Bottom Navigation Actions */}
      <div className="fixed bottom-0 w-full bg-[#0b1f1b]/95 backdrop-blur-md border-t border-[#1B3530] p-4 flex justify-between gap-4 max-w-md left-1/2 -translate-x-1/2">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 rounded-xl border border-[#1B3530] text-[#9FB7B2] font-bold disabled:opacity-30 disabled:hidden transition-colors"
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={step === 2 && (!teamA || !teamB)} // Require team names before proceeding
            className="flex-1 bg-[#0FAF9A] text-[#061311] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#19F0C1] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(15,175,154,0.2)] ml-auto"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleStartMatch}
            disabled={!matchTossDecision} // Must choose bat/bowl to start
            className="flex-1 bg-[#FF6B6B] text-[#061311] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#ff8787] disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(255,107,107,0.3)] ml-auto"
          >
            Start Match <Play className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewMatchPage;
