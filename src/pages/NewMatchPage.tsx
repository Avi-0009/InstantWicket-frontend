import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  CircleDashed,
  Play,
  Search,
  RefreshCw,
} from "lucide-react";

import { useSearchPlayerStats, useAddGuest } from "../hooks/usePlayerQueries";
import { useDebounce } from "../hooks/useDebounce";
import { useCreateMatch } from "../hooks/useMatchMutations";
import { useAuthStore } from "../store/useAuthStore";

// ============================================================================
// REUSABLE PLAYER SEARCH WITH INLINE GUEST ADDING (PUSH-DOWN DESIGN)
// ============================================================================
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
  const wrapperRef = useRef<HTMLDivElement>(null);

  // State for inline guest creation
  const [newPhone, setNewPhone] = useState("");
  const { mutateAsync: addGuest, isPending: isAddingGuest } = useAddGuest();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddGuest = async () => {
    if (newPhone.length < 10) return;
    try {
      const newPlayer = await addGuest({ name: query, phone_no: newPhone });
      onSelect({
        id: newPlayer.player_id || newPlayer.id,
        name: newPlayer.name,
        user_id: newPlayer.user_id,
      });
      setQuery(newPlayer.name);
      setOpen(false);
      setNewPhone("");
    } catch (err) {
      alert("Failed to add player");
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full bg-background border border-border text-foreground text-sm rounded-lg py-2 px-3 focus:border-primary outline-none"
        placeholder={placeholder}
      />
      {open && query && (
        <div className="w-full bg-card border border-border rounded-lg mt-1 shadow-sm flex flex-col overflow-hidden">
          {isPending ? (
            <div className="p-3 text-xs font-bold text-primary animate-pulse">
              Searching...
            </div>
          ) : (
            <>
              {/* SCROLLABLE RESULTS */}
              {data && data.length > 0 && (
                <div className="max-h-33.75 overflow-y-auto no-scrollbar">
                  {data.map((p: any) => (
                    <div
                      key={p.player_id}
                      onMouseDown={() => {
                        onSelect({
                          id: p.player_id,
                          name: p.name,
                          user_id: p.user_id,
                        });
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
                  ))}
                </div>
              )}

              {/* 🔥 GUEST FORM ONLY SHOWS IF TYPED >= 3 CHARACTERS */}
              {query.length >= 3 && (
                <div className="p-3 bg-muted/20 border-t border-border/50 shrink-0">
                  <p className="text-xs font-bold text-muted-foreground mb-2">
                    {data && data.length > 0
                      ? "Not the right player? Add new:"
                      : "Player not found. Add new:"}
                  </p>
                  <input
                    type="tel"
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("0")) val = val.slice(1);
                      setNewPhone(val);
                    }}
                    placeholder="10-digit Phone No."
                    className="w-full bg-background border border-border text-foreground rounded py-2 px-3 text-xs focus:border-primary outline-none mb-2 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddGuest}
                    disabled={isAddingGuest || newPhone.length < 10}
                    className="w-full bg-primary text-background px-3 py-2 rounded font-bold text-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isAddingGuest ? "Adding..." : "+ Add Player"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const NewMatchPage = () => {
  const navigate = useNavigate();
  const hostId = useAuthStore((state) => state.user?.id);
  const { mutateAsync: createMatch, isPending: isCreatingMatch } =
    useCreateMatch();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [matchType, setMatchType] = useState("T20");
  const [customOvers, setCustomOvers] = useState("5");

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  const [umpire1, setUmpire1] = useState<{
    id: string;
    name: string;
    user_id?: string;
  } | null>(null);

  const [commonPlayer, setCommonPlayer] = useState<{
    id: string;
    name: string;
    user_id?: string;
  } | null>(null);

  const [allowUmpire, setAllowUmpire] = useState(false);
  const [allowSolo, setAllowSolo] = useState(false);
  const [allowCommon, setAllowCommon] = useState(false);

  const [isFlipping, setIsFlipping] = useState(false);
  const [matchTossWinner, setMatchTossWinner] = useState<string | null>(null);
  const [matchTossDecision, setMatchTossDecision] = useState<
    "bat" | "bowl" | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isPending: isSearching } =
    useSearchPlayerStats(debouncedSearch);

  const [teamAPlayers, setTeamAPlayers] = useState<
    { id: string; name: string; user_id?: string }[]
  >([]);
  const [teamBPlayers, setTeamBPlayers] = useState<
    { id: string; name: string; user_id?: string }[]
  >([]);

  // Main Search Bar Guest State
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPhone, setNewPlayerPhone] = useState("");
  const { mutateAsync: addGuest, isPending: isAddingGuest } = useAddGuest();

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleHeaderBack = () => {
    if (step > 1) {
      handleBack();
    } else {
      navigate(-1);
    }
  };

  const handleMatchToss = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setMatchTossWinner(Math.random() > 0.5 ? teamA : teamB);
      setIsFlipping(false);
    }, 1500);
  };

  const allSelectedIds = [
    hostId,
    umpire1?.id,
    commonPlayer?.id,
    ...teamAPlayers.map((p) => p.id),
    ...teamBPlayers.map((p) => p.id),
  ].filter(Boolean);

  const maxRegularPlayers = allowCommon ? 10 : 11;
  const minRequiredPlayers = allowCommon ? 2 : 3; // 🔥 MIN PLAYERS LOGIC

  const addPlayerToTeam = (player: any, team: "A" | "B") => {
    const formattedPlayer = {
      id: player.player_id || player.id,
      name: player.name,
      user_id: player.user_id,
    };
    if (team === "A" && teamAPlayers.length < maxRegularPlayers) {
      setTeamAPlayers([...teamAPlayers, formattedPlayer]);
    } else if (team === "B" && teamBPlayers.length < maxRegularPlayers) {
      setTeamBPlayers([...teamBPlayers, formattedPlayer]);
    }
    setSearchQuery("");
  };

  const removePlayerFromTeam = (playerId: string, team: "A" | "B") => {
    if (team === "A") {
      setTeamAPlayers((prev) => prev.filter((p) => p.id !== playerId));
    } else {
      setTeamBPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }
  };

  const handleStartMatch = async () => {
    try {
      let finalOvers = 5;
      if (matchType === "T20") finalOvers = 20;
      else if (matchType === "T10") finalOvers = 10;
      else if (matchType === "ODI") finalOvers = 50;
      else finalOvers = parseInt(customOvers, 10) || 5;

      const formattedTeamA = teamAPlayers.map((p, index) => ({
        id: p.id,
        name: p.name,
        phone_no: "",
        is_common_player: false,
        is_captain: index === 0,
        is_wicket_keeper: false,
      }));

      if (commonPlayer) {
        formattedTeamA.push({
          id: commonPlayer.id,
          name: commonPlayer.name,
          phone_no: "",
          is_common_player: true,
          is_captain: false,
          is_wicket_keeper: false,
        });
      }

      const formattedTeamB = teamBPlayers.map((p, index) => ({
        id: p.id,
        name: p.name,
        phone_no: "",
        is_common_player: false,
        is_captain: index === 0,
        is_wicket_keeper: false,
      }));

      if (commonPlayer) {
        formattedTeamB.push({
          id: commonPlayer.id,
          name: commonPlayer.name,
          phone_no: "",
          is_common_player: true,
          is_captain: false,
          is_wicket_keeper: false,
        });
      }

      const payload = {
        team_a_name: teamA,
        team_b_name: teamB,
        team_a_players: formattedTeamA,
        team_b_players: formattedTeamB,
        toss_winner_team_id: matchTossWinner === teamA ? "A" : "B",
        toss_decision: matchTossDecision!,
        allow_common_player: !!commonPlayer,
        allow_solo_batting: allowSolo,
        overs_limit: finalOvers,
        umpire_id: umpire1?.user_id || "",
      };

      const response = await createMatch(payload);

      const finalMatchId = response.match?.id || response.match_id;
      navigate(`/matches/${finalMatchId}/score`);
    } catch (error: any) {
      console.error("Failed to create match:", error);
      if (error.response) {
        alert(
          `Server Error: ${error.response.data.error || JSON.stringify(error.response.data)}`,
        );
      }
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 1: MATCH FORMAT & OVERS
  // ---------------------------------------------------------------------------
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
            min="1"
            max="50"
            value={customOvers}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val === "") {
                setCustomOvers("");
                return;
              }
              const num = parseInt(val, 10);
              if (num > 50) {
                setCustomOvers("50");
              } else if (num > 0) {
                setCustomOvers(num.toString());
              }
            }}
            onBlur={() => {
              if (!customOvers || parseInt(customOvers, 10) < 1) {
                setCustomOvers("5");
              }
            }}
            placeholder="e.g. 15"
            className="w-full bg-card border border-border text-foreground rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------------------------------
  // STEP 2: TEAMS, UMPIRE, & SOLO BATTING
  // ---------------------------------------------------------------------------
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
          {teamA.trim().length > 0 && teamA.trim().length < 3 && (
            <p className="text-destructive text-xs font-bold mt-1">
              Must be at least 3 characters.
            </p>
          )}
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
          {teamB.trim().length > 0 && teamB.trim().length < 3 && (
            <p className="text-destructive text-xs font-bold mt-1">
              Must be at least 3 characters.
            </p>
          )}
          {teamA.trim() &&
            teamB.trim() &&
            teamA.trim().toLowerCase() === teamB.trim().toLowerCase() && (
              <p className="text-destructive text-xs font-bold mt-2">
                Teams cannot have the exact same name.
              </p>
            )}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-foreground">
              Match Official (Umpire)
            </p>
            <p className="text-xs text-muted-foreground">
              Assign an umpire to score the match
            </p>
          </div>
          <button
            onClick={() => {
              setAllowUmpire(!allowUmpire);
              if (allowUmpire) setUmpire1(null);
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              allowUmpire ? "bg-primary" : "bg-border"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                allowUmpire ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {allowUmpire && (
          <div className="animate-fade-in pl-1">
            <label className="text-xs font-bold text-muted-foreground block mb-2">
              Select Umpire
            </label>
            <PlayerSearchInput
              placeholder="Search Umpire Name or Phone..."
              value={umpire1}
              onSelect={setUmpire1}
              excludeIds={allSelectedIds}
            />
          </div>
        )}

        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
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
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              allowSolo ? "bg-primary" : "bg-border"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                allowSolo ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // STEP 3: THE GROUND (PLAYER SELECTION + CAPTAINCY + COMMON PLAYER)
  // ---------------------------------------------------------------------------
  const renderStep3 = () => (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold text-foreground text-center mb-6">
        The Ground
        <span className="block text-sm text-muted-foreground font-normal mt-1">
          Add at least {minRequiredPlayers} players per team. First pick is
          Captain!
        </span>
      </h2>

      {/* MAIN SEARCH BAR */}
      <div className="relative w-full mb-2">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Player by Name or Phone..."
          className="w-full bg-card border border-border text-foreground rounded-lg py-2 pl-9 pr-4 focus:outline-none focus:border-primary text-sm transition-colors"
        />
      </div>

      {/* 🔥 PUSH-DOWN SEARCH RESULTS & GUEST ADD */}
      {searchQuery && (
        <div className="w-full bg-card border border-border rounded-lg mb-6 flex flex-col overflow-hidden shadow-sm animate-fade-in">
          {isSearching ? (
            <div className="p-3 text-center text-xs text-primary font-semibold animate-pulse">
              Searching database...
            </div>
          ) : (
            <>
              {/* SCROLLABLE RESULTS */}
              {searchResults && searchResults.length > 0 && (
                <div className="max-h-55 overflow-y-auto no-scrollbar">
                  {searchResults.map((player: any) => {
                    const isBlocked = allSelectedIds.includes(player.player_id);

                    return (
                      <div
                        key={player.player_id}
                        className={`p-3 border-b ${
                          isBlocked
                            ? "border-border/30 opacity-50 bg-background"
                            : "border-border/50 bg-card hover:bg-primary/5"
                        } flex items-center justify-between transition-colors`}
                      >
                        <div>
                          <span className="text-foreground text-sm font-bold block truncate max-w-30">
                            {player.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {player.phone_no}
                          </span>
                          {isBlocked && (
                            <span className="text-[9px] text-destructive font-bold ml-1 uppercase">
                              Already assigned
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => addPlayerToTeam(player, "A")}
                            disabled={
                              teamAPlayers.length >= maxRegularPlayers ||
                              isBlocked
                            }
                            className="text-xs bg-background border border-border px-3 py-1.5 rounded hover:border-primary text-foreground disabled:opacity-30 transition-colors"
                          >
                            Add to A
                          </button>
                          <button
                            onClick={() => addPlayerToTeam(player, "B")}
                            disabled={
                              teamBPlayers.length >= maxRegularPlayers ||
                              isBlocked
                            }
                            className="text-xs bg-background border border-border px-3 py-1.5 rounded hover:border-destructive text-foreground disabled:opacity-30 transition-colors"
                          >
                            Add to B
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 🔥 LOCKED GUEST FORM AT BOTTOM (ONLY >= 3 CHARACTERS) */}
              {searchQuery.length >= 3 && (
                <div className="p-3 bg-muted/20 border-t border-border/50 shrink-0">
                  <p className="text-xs font-bold text-muted-foreground mb-2">
                    {searchResults && searchResults.length > 0
                      ? "Not the right player? No problem add as guest."
                      : "Player not found. Add as guest?"}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Player Full Name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full bg-background border border-border text-foreground rounded-md py-1.5 px-3 text-sm focus:border-primary outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="10-digit Phone No."
                        maxLength={10}
                        value={newPlayerPhone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("0")) val = val.slice(1);
                          setNewPlayerPhone(val);
                        }}
                        className="w-full bg-background border border-border text-foreground rounded-md py-1.5 px-3 text-sm focus:border-primary outline-none"
                      />
                      <button
                        disabled={
                          isAddingGuest ||
                          newPlayerName.length < 3 ||
                          newPlayerPhone.length < 10
                        }
                        onClick={async () => {
                          try {
                            await addGuest({
                              name: newPlayerName,
                              phone_no: newPlayerPhone,
                            });
                            setSearchQuery(newPlayerPhone);
                            setNewPlayerName("");
                            setNewPlayerPhone("");
                          } catch (err) {
                            alert("Failed to add guest player.");
                          }
                        }}
                        className="bg-primary text-background px-4 rounded-md font-bold text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {isAddingGuest ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PLAYING 11 GRID */}
      <div className="relative w-full bg-border/30 border-2 border-border rounded-3xl p-4 overflow-hidden mt-6 shadow-inner z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-[90%] border-2 border-border/50 rounded-[100px] pointer-events-none z-0" />

        <div className="flex gap-4 relative z-10">
          {/* TEAM A COLUMN */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-center font-bold text-primary text-sm mb-4 border-b border-border pb-2 truncate">
              {teamA || "Team A"}
            </h3>

            {Array.from({ length: maxRegularPlayers }).map((_, i) => {
              const player = teamAPlayers[i];
              const isCaptain = i === 0;

              return (
                <div
                  key={`a-${i}`}
                  // 🔥 FLASH/HIGHLIGHT STYLING FOR ADDED PLAYERS
                  className={`flex items-center gap-2 p-2 border rounded-lg relative group transition-all duration-300 ${
                    player
                      ? "bg-primary/5 border-primary shadow-[0_0_8px_rgba(15,175,154,0.3)]"
                      : "bg-background/50 border-border/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      player
                        ? "bg-primary/20 text-primary"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs truncate flex-1 ${
                      player
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground italic"
                    }`}
                  >
                    {player
                      ? player.name
                      : isCaptain
                        ? "Empty (Captain)"
                        : "Empty Slot"}
                  </span>
                  {isCaptain && player && (
                    <span className="absolute -top-2 -right-1 bg-warning text-background text-[9px] font-black px-1.5 py-0.5 rounded shadow z-20">
                      CAP
                    </span>
                  )}
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

          {/* TEAM B COLUMN */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-center font-bold text-destructive text-sm mb-4 border-b border-border pb-2 truncate">
              {teamB || "Team B"}
            </h3>

            {Array.from({ length: maxRegularPlayers }).map((_, i) => {
              const player = teamBPlayers[i];
              const isCaptain = i === 0;

              return (
                <div
                  key={`b-${i}`}
                  // 🔥 FLASH/HIGHLIGHT STYLING FOR ADDED PLAYERS
                  className={`flex items-center gap-2 p-2 border rounded-lg relative flex-row-reverse group transition-all duration-300 ${
                    player
                      ? "bg-destructive/5 border-destructive shadow-[0_0_8px_rgba(255,107,107,0.3)]"
                      : "bg-background/50 border-border/50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      player
                        ? "bg-destructive/20 text-destructive"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs truncate flex-1 text-right ${
                      player
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground italic"
                    }`}
                  >
                    {player
                      ? player.name
                      : isCaptain
                        ? "Empty (Captain)"
                        : "Empty Slot"}
                  </span>
                  {isCaptain && player && (
                    <span className="absolute -top-2 -left-1 bg-warning text-background text-[9px] font-black px-1.5 py-0.5 rounded shadow z-20">
                      CAP
                    </span>
                  )}
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

      {/* 🔥 COMMON PLAYER TOGGLE */}
      <div className="mt-8 pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-bold text-foreground">
              Allow Common Player
            </p>
            <p className="text-xs text-muted-foreground">
              A designated player fields/bats for both teams
            </p>
          </div>
          <button
            onClick={() => {
              setAllowCommon(!allowCommon);
              if (allowCommon) setCommonPlayer(null); // Clear if toggled off
            }}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              allowCommon ? "bg-primary" : "bg-border"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                allowCommon ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* COMMON PLAYER SEARCH */}
        {allowCommon && (
          <div className="animate-fade-in pl-1">
            <label className="text-xs font-bold text-muted-foreground block mb-2">
              Select Common Player
            </label>
            {!commonPlayer ? (
              <PlayerSearchInput
                placeholder="Search Player to add to both teams..."
                value={commonPlayer}
                onSelect={setCommonPlayer}
                excludeIds={allSelectedIds}
              />
            ) : (
              <div className="flex items-center justify-between p-3 bg-card border border-warning shadow-[0_0_10px_rgba(234,179,8,0.2)] rounded-xl mx-auto max-w-xs mt-2 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning/20 text-warning flex items-center justify-center font-black text-sm">
                    C
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {commonPlayer.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Plays for both teams
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCommonPlayer(null)}
                  className="text-muted-foreground hover:text-destructive p-2 transition-colors"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // STEP 4: MATCH TOSS
  // ---------------------------------------------------------------------------
  const renderStep4 = () => (
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
            className={`w-12 h-12 ${
              isFlipping ? "text-destructive" : "text-muted-foreground"
            }`}
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

      <div className="px-4 pt-6 pb-2 max-w-md mx-auto w-full">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full bg-border overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx + 1 === totalSteps ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: step > idx ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-muted-foreground mt-3 uppercase tracking-wider">
          Step {step} of {totalSteps}
        </p>
      </div>

      <main className="max-w-md mx-auto p-4 pb-32 min-h-100">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </main>

      <div className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border p-4 flex justify-between gap-4 max-w-md left-1/2 -translate-x-1/2">
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={
              // 🔥 STEP 2 VALIDATIONS: Names empty, Names too short, Duplicate Names, or Umpire Missing
              (step === 2 &&
                (teamA.trim().length < 3 ||
                  teamB.trim().length < 3 ||
                  teamA.trim().toLowerCase() === teamB.trim().toLowerCase() ||
                  (allowUmpire && !umpire1))) ||
              // 🔥 STEP 3 VALIDATIONS: Minimum Players Not Met OR Common Player Missing
              (step === 3 &&
                ((allowCommon && !commonPlayer) ||
                  teamAPlayers.length < minRequiredPlayers ||
                  teamBPlayers.length < minRequiredPlayers))
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
