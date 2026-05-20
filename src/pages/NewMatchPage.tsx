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
  Search,
  RefreshCw,
} from "lucide-react";

import { useSearchPlayerStats } from "../hooks/usePlayerQueries";
import { useDebounce } from "../hooks/useDebounce";
import { useCreateMatch } from "../hooks/useMatchMutations";
import { api } from "../Api/Auth";
import { useAuthStore } from "../store/useAuthStore";

// Invisible Search Wrapper for Step 3 Inputs (Preserves your exact UI)
const PlayerSearchInput = ({
  placeholder,
  value,
  onSelect,
  excludeIds = [],
}: any) => {
  const [query, setQuery] = useState(value?.name || "");
  const debounced = useDebounce(query, 300);
  const { data, isPending } = useSearchPlayerStats(debounced);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="w-full bg-background border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:border-primary outline-none"
        placeholder={placeholder}
      />
      {open && query && (
        <div className="absolute top-full left-0 w-full bg-card border border-border rounded-lg mt-1 shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto no-scrollbar">
          {isPending ? (
            <div className="p-3 text-xs font-bold text-primary animate-pulse">
              Searching...
            </div>
          ) : data && data.length > 0 ? (
            data.map((p: any) => (
              <div
                key={p.player_id}
                onClick={() => {
                  onSelect({ id: p.player_id, name: p.name });
                  setQuery(p.name);
                  setOpen(false);
                }}
                className={`p-2 text-sm border-b border-border/50 hover:bg-primary/10 cursor-pointer ${
                  excludeIds.includes(p.player_id)
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                <div className="font-bold text-foreground">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {p.phone_no}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-xs font-bold text-muted-foreground">
              No players found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NewMatchPage = () => {
  const navigate = useNavigate();
  const hostId = useAuthStore((state) => state.user?.id);
  const { mutateAsync: createMatch, isPending: isCreatingMatch } =
    useCreateMatch();

  // Wizard State
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [matchType, setMatchType] = useState("T20");
  const [customOvers, setCustomOvers] = useState("");

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  // Captains & Umpires (Now storing ID & Name objects)
  const [captainA, setCaptainA] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [captainB, setCaptainB] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [umpire1, setUmpire1] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [umpire2, setUmpire2] = useState<{ id: string; name: string } | null>(
    null,
  );

  const [allowSolo, setAllowSolo] = useState(false);
  const [allowCommon, setAllowCommon] = useState(false);

  // Toss States
  const [isFlipping, setIsFlipping] = useState(false);
  const [draftTossWinner, setDraftTossWinner] = useState<string | null>(null);
  const [matchTossWinner, setMatchTossWinner] = useState<string | null>(null);
  const [matchTossDecision, setMatchTossDecision] = useState<
    "bat" | "bowl" | null
  >(null);

  // Ground / Player Selection States (Step 5)
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isPending: isSearching } =
    useSearchPlayerStats(debouncedSearch);

  const [teamAPlayers, setTeamAPlayers] = useState<
    { id: string; name: string }[]
  >([]);
  const [teamBPlayers, setTeamBPlayers] = useState<
    { id: string; name: string }[]
  >([]);

  // Handlers
  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleHeaderBack = () => {
    if (step > 1) {
      handleBack();
    } else {
      navigate(-1);
    }
  };

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

  const addPlayerToTeam = (player: any, team: "A" | "B") => {
    const formattedPlayer = { id: player.player_id, name: player.name };
    if (team === "A" && teamAPlayers.length < 10) {
      setTeamAPlayers([...teamAPlayers, formattedPlayer]);
    } else if (team === "B" && teamBPlayers.length < 10) {
      setTeamBPlayers([...teamBPlayers, formattedPlayer]);
    }
    setSearchQuery("");
  };

  // Central Logic: Chains Team Creation -> Match Creation
  const handleStartMatch = async () => {
    try {
      // 1. Create Teams
      const resA = await api.post("/teams", { name: teamA });
      const team_a_id = resA.data.teamID;

      const resB = await api.post("/teams", { name: teamB });
      const team_b_id = resB.data.teamID;

      // 2. Resolve UUIDs
      const toss_winner_team_id =
        matchTossWinner === teamA ? team_a_id : team_b_id;
      let overs = 20;
      if (matchType === "T10") overs = 10;
      if (matchType === "ODI") overs = 50;
      if (matchType === "Custom") overs = parseInt(customOvers) || 20;

      // 3. Create Match
      await createMatch({
        team_a_id,
        team_b_id,
        toss_winner_team_id,
        toss_decision: matchTossDecision!,
        allow_common_player: allowCommon,
        allow_solo_batting: allowSolo,
        overs_limit: overs,
        umpire_id: umpire1?.id || undefined,
      });

      navigate("/match/live");
    } catch (error) {
      console.error("Failed to start match:", error);
    }
  };

  // --- STEP RENDERERS ---

  const renderStep1 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" /> Select Match Format
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {["T20", "ODI", "T10", "Custom"].map((type) => (
          <button
            key={type}
            onClick={() => setMatchType(type)}
            className={`p-4 rounded-xl border-2 font-bold transition-all ${
              matchType === type
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
      {matchType === "Custom" && (
        <div className="mt-4 animate-fade-in">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Number of Overs
          </label>
          <input
            type="number"
            value={customOvers}
            onChange={(e) => setCustomOvers(e.target.value)}
            placeholder="e.g. 15"
            className="w-full bg-card border border-border text-foreground rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" /> Name Your Teams
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Team A Name
          </label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder="e.g. Warriors"
            className="w-full bg-card border border-border text-foreground rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex justify-center py-2 text-muted-foreground font-black italic">
          VS
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Team B Name
          </label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder="e.g. Titans"
            className="w-full bg-card border border-border text-foreground rounded-xl py-3 px-4 focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" /> Match Officials & Rules
      </h2>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Captain ({teamA || "Team A"})
            </label>
            <PlayerSearchInput
              placeholder="Name"
              value={captainA}
              onSelect={setCaptainA}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Captain ({teamB || "Team B"})
            </label>
            <PlayerSearchInput
              placeholder="Name"
              value={captainB}
              onSelect={setCaptainB}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Umpire 1
            </label>
            <PlayerSearchInput
              placeholder="Optional"
              value={umpire1}
              onSelect={setUmpire1}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">
              Umpire 2
            </label>
            <PlayerSearchInput
              placeholder="Optional"
              value={umpire2}
              onSelect={setUmpire2}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">
              Allow Common Players
            </p>
            <p className="text-xs text-muted-foreground">
              Players can field/bat for both teams
            </p>
          </div>
          <button
            onClick={() => setAllowCommon(!allowCommon)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${allowCommon ? "bg-primary" : "bg-border"}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${allowCommon ? "translate-x-6" : ""}`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm font-bold text-foreground">
              Solo Player Mode
            </p>
            <p className="text-xs text-muted-foreground">
              Batsman can play without a non-striker
            </p>
          </div>
          <button
            onClick={() => setAllowSolo(!allowSolo)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${allowSolo ? "bg-primary" : "bg-border"}`}
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
      <h2 className="text-xl font-bold text-foreground text-center">
        Draft Toss
        <span className="block text-sm text-muted-foreground font-normal mt-1">
          Who picks their players first?
        </span>
      </h2>

      {!draftTossWinner ? (
        <button
          onClick={handleDraftToss}
          disabled={isFlipping}
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(15,175,154,0.3)] transition-all ${
            isFlipping
              ? "border-primary animate-[spin_0.2s_linear_infinite]"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <CircleDashed
            className={`w-12 h-12 ${isFlipping ? "text-primary" : "text-muted-foreground"}`}
          />
        </button>
      ) : (
        <div className="text-center animate-bounce-in w-full">
          <div className="w-24 h-24 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(15,175,154,0.4)]">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-black text-foreground">
            {draftTossWinner}
          </h3>
          <p className="text-primary font-bold mt-1">Won the draft toss!</p>

          <button
            onClick={() => setDraftTossWinner(null)}
            className="mt-8 flex items-center justify-center gap-2 mx-auto text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Toss Again
          </button>
        </div>
      )}
    </div>
  );

  // Add this helper function right above renderStep5
  const removePlayerFromTeam = (playerId: string, team: "A" | "B") => {
    if (team === "A") {
      setTeamAPlayers((prev) => prev.filter((p) => p.id !== playerId));
    } else {
      setTeamBPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }
  };

  const renderStep5 = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold text-foreground text-center mb-6">
        The Ground
        <span className="block text-sm text-muted-foreground font-normal mt-1">
          Select Playing 11
        </span>
      </h2>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Player by Name or Phone..."
            className="w-full bg-card border border-border text-foreground rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <button className="bg-primary text-background px-4 rounded-lg font-bold hover:bg-primary/80 transition-colors text-sm">
          Search
        </button>
      </div>

      {isSearching && (
        <div className="text-center py-2 animate-pulse text-xs text-primary font-semibold">
          Searching database...
        </div>
      )}

      {!isSearching && searchResults && searchResults.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
          {searchResults.slice(0, 4).map((player: any) => {
            // Block Umpires & Host from playing
            const isBlocked =
              player.player_id === umpire1?.id ||
              player.player_id === umpire2?.id ||
              player.user_id === hostId;

            // Check if player is already in a team OR is already a captain
            const inA =
              teamAPlayers.some((p) => p.id === player.player_id) ||
              player.player_id === captainA?.id;
            const inB =
              teamBPlayers.some((p) => p.id === player.player_id) ||
              player.player_id === captainB?.id;

            return (
              <div
                key={player.player_id}
                className="p-3 bg-card border border-primary/50 rounded-lg flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="text-foreground text-sm font-bold block truncate max-w-[120px]">
                    {player.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {player.phone_no}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => addPlayerToTeam(player, "A")}
                    disabled={
                      teamAPlayers.length >= 10 || isBlocked || inA || inB
                    }
                    className="text-xs bg-background border border-border px-3 py-1.5 rounded hover:border-primary text-foreground disabled:opacity-30 transition-colors"
                  >
                    Add to {teamA || "A"}
                  </button>
                  <button
                    onClick={() => addPlayerToTeam(player, "B")}
                    disabled={
                      teamBPlayers.length >= 10 || isBlocked || inA || inB
                    }
                    className="text-xs bg-background border border-border px-3 py-1.5 rounded hover:border-destructive text-foreground disabled:opacity-30 transition-colors"
                  >
                    Add to {teamB || "B"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* The Ground UI */}
      <div className="relative w-full bg-[#1b3530]/30 border-2 border-border rounded-3xl p-4 overflow-hidden mt-6 shadow-inner z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-[90%] border-2 border-border/50 rounded-[100px] pointer-events-none z-0" />

        <div className="flex gap-4 relative z-10">
          {/* TEAM A ROSTER */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-center font-bold text-primary text-sm mb-4 border-b border-border pb-2 truncate">
              {teamA || "Team A"}
            </h3>

            {/* Captain Slot (Locked - No Remove Button) */}
            <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg relative shadow-md">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-black shrink-0">
                1
              </div>
              <span className="text-xs font-bold text-foreground truncate flex-1">
                {captainA?.name || "Captain A"}
              </span>
              <span className="absolute -top-2 -right-1 bg-warning text-background text-[9px] font-black px-1.5 py-0.5 rounded shadow z-20">
                CAP
              </span>
            </div>

            {/* Remaining 10 Slots (Removable) */}
            {Array.from({ length: 10 }).map((_, i) => {
              const player = teamAPlayers[i];
              return (
                <div
                  key={`a-${i}`}
                  className="flex items-center gap-2 p-2 bg-background/50 border border-border/50 rounded-lg group"
                >
                  <div className="w-6 h-6 rounded-full bg-border text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 2}
                  </div>
                  <span
                    className={`text-xs truncate flex-1 ${player ? "text-foreground font-semibold" : "text-muted-foreground italic"}`}
                  >
                    {player ? player.name : "Empty Slot"}
                  </span>
                  {/* Remove Button */}
                  {player && (
                    <button
                      onClick={() => removePlayerFromTeam(player.id, "A")}
                      className="text-muted-foreground hover:text-destructive transition-colors px-1"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* TEAM B ROSTER */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-center font-bold text-destructive text-sm mb-4 border-b border-border pb-2 truncate">
              {teamB || "Team B"}
            </h3>

            {/* Captain Slot (Locked - No Remove Button) */}
            <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg relative shadow-md flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-xs font-black shrink-0">
                1
              </div>
              <span className="text-xs font-bold text-foreground truncate flex-1 text-right">
                {captainB?.name || "Captain B"}
              </span>
              <span className="absolute -top-2 -left-1 bg-warning text-background text-[9px] font-black px-1.5 py-0.5 rounded shadow z-20">
                CAP
              </span>
            </div>

            {/* Remaining 10 Slots (Removable) */}
            {Array.from({ length: 10 }).map((_, i) => {
              const player = teamBPlayers[i];
              return (
                <div
                  key={`b-${i}`}
                  className="flex items-center gap-2 p-2 bg-background/50 border border-border/50 rounded-lg flex-row-reverse group"
                >
                  <div className="w-6 h-6 rounded-full bg-border text-muted-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 2}
                  </div>
                  <span
                    className={`text-xs truncate flex-1 text-right ${player ? "text-foreground font-semibold" : "text-muted-foreground italic"}`}
                  >
                    {player ? player.name : "Empty Slot"}
                  </span>
                  {/* Remove Button */}
                  {player && (
                    <button
                      onClick={() => removePlayerFromTeam(player.id, "B")}
                      className="text-muted-foreground hover:text-destructive transition-colors px-1"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="animate-fade-in space-y-8 flex flex-col items-center justify-center py-8">
      <h2 className="text-xl font-bold text-foreground text-center">
        Match Toss
        <span className="block text-sm text-muted-foreground font-normal mt-1">
          Bat or Bowl?
        </span>
      </h2>

      {!matchTossWinner ? (
        <button
          onClick={handleMatchToss}
          disabled={isFlipping}
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(255,107,107,0.3)] transition-all ${
            isFlipping
              ? "border-destructive animate-[spin_0.2s_linear_infinite]"
              : "border-border bg-card hover:border-destructive/50"
          }`}
        >
          <CircleDashed
            className={`w-12 h-12 ${isFlipping ? "text-destructive" : "text-muted-foreground"}`}
          />
        </button>
      ) : (
        <div className="text-center animate-bounce-in w-full">
          <h3 className="text-2xl font-black text-foreground mb-1">
            {matchTossWinner}
          </h3>
          <p className="text-muted-foreground mb-6">
            won the toss and elected to...
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMatchTossDecision("bat")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                matchTossDecision === "bat"
                  ? "bg-primary text-background border-primary shadow-[0_0_20px_rgba(15,175,154,0.3)]"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              BAT
            </button>
            <button
              onClick={() => setMatchTossDecision("bowl")}
              className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-all ${
                matchTossDecision === "bowl"
                  ? "bg-destructive text-background border-destructive shadow-[0_0_20px_rgba(255,107,107,0.3)]"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              BOWL
            </button>
          </div>

          <button
            onClick={() => {
              setMatchTossWinner(null);
              setMatchTossDecision(null);
            }}
            className="mt-8 flex items-center justify-center gap-2 mx-auto text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Toss Again
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans pb-8">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={handleHeaderBack}
          className="p-2 bg-card border border-border rounded-full text-foreground hover:bg-border transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Create Match</h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full bg-border overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${idx + 1 === totalSteps ? "bg-destructive" : "bg-primary"}`}
                style={{ width: step > idx ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-muted-foreground mt-3 uppercase tracking-wider">
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 pb-32 min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
      </main>

      {/* Bottom Navigation Actions */}
      <div className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border p-4 flex justify-between gap-4 max-w-md left-1/2 -translate-x-1/2">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 rounded-xl border border-border text-muted-foreground font-bold hover:bg-background disabled:opacity-30 disabled:hidden transition-colors"
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={
              (step === 2 && (!teamA || !teamB)) ||
              (step === 3 && (!captainA || !captainB))
            }
            className="flex-1 bg-primary text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(15,175,154,0.2)] ml-auto"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleStartMatch}
            disabled={!matchTossDecision || isCreatingMatch}
            className="flex-1 bg-destructive text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,107,107,0.3)] ml-auto"
          >
            {isCreatingMatch ? "Starting..." : "Start Match"}{" "}
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NewMatchPage;
