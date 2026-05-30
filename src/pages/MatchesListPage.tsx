import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Activity, Inbox, ChevronDown } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { api } from "../Api/Auth"; // Using direct API to handle pagination state safely
import toast from "react-hot-toast";

const MatchesListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // PAGINATION & DATA STATES
  const [matches, setMatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isError, setIsError] = useState(false);

  // FETCH MATCHES WITH PAGINATION APPEND LOGIC
  useEffect(() => {
    const fetchMatches = async () => {
      if (page === 1) setIsLoadingInitial(true);
      else setIsFetchingPage(true);
      setIsError(false);

      try {
        const res = await api.get(`/matches?page=${page}&limit=10`);
        const newMatches = res.data.matches || res.data || [];

        // Check if we reached the end of the database
        if (newMatches.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Append to existing array on page 2+, or set fresh on page 1
        setMatches((prev) =>
          page === 1 ? newMatches : [...prev, ...newMatches],
        );
      } catch (error) {
        console.error("Failed to fetch matches:", error);
        setIsError(true);
        toast.error("Failed to load matches!");
      } finally {
        setIsLoadingInitial(false);
        setIsFetchingPage(false);
      }
    };

    fetchMatches();
  }, [page]);

  // Filter based on the selected tab
  const filteredMatches =
    activeTab === "all"
      ? matches
      : matches.filter((m: any) => m.status === activeTab);

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-background min-h-screen transition-colors duration-200">
      <PageHeader title="Matches" backUrl="/" />

      {/* Filter Tabs */}
      <div className="bg-card border border-border p-1 rounded-xl flex gap-1 mb-6 overflow-x-auto no-scrollbar shadow-sm transition-colors">
        {["all", "ongoing", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-border text-primary shadow-sm border border-border"
                : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
            }`}
          >
            {tab === "ongoing" ? "Live" : tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoadingInitial ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary">
          <Activity className="animate-spin w-8 h-8 mb-4" />
          <p className="text-sm font-bold animate-pulse">Loading Matches...</p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-destructive/15 text-destructive p-4 rounded-full mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-foreground font-bold text-lg mb-2">
            Oops! Something went wrong.
          </h3>
          <p className="text-muted-foreground text-sm">
            Failed to load matches from the server.
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        /* Beautiful Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl border-dashed transition-colors">
          <div className="bg-border/50 p-4 rounded-full mb-4">
            <Inbox className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-foreground font-bold text-lg mb-2">
            No Matches Found
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm px-4">
            {activeTab === "all"
              ? "You haven't created or participated in any matches yet. Start a new game to see it here!"
              : `There are no ${activeTab === "ongoing" ? "live" : activeTab} matches at the moment.`}
          </p>
          {activeTab === "all" && (
            <button
              onClick={() => navigate("/new-match")}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-hover transition-all shadow-[0_0_15px_rgba(15,175,154,0.3)]"
            >
              Start a New Match
            </button>
          )}
        </div>
      ) : (
        /* Real Matches List */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {filteredMatches.map((match: any) => {
              // Calculate Dynamic Data for Each Card
              const isCompleted = match.status === "completed";
              const isOngoing = match.status === "ongoing";

              const formatOvers = (balls: number) => {
                return `${Math.floor((balls || 0) / 6)}.${(balls || 0) % 6}`;
              };

              let resultText = "";
              if (isCompleted) {
                if (match.winner_team_id) {
                  resultText =
                    match.winner_team_id === match.team_a_id
                      ? `🏆 ${match.team_a_name} won the match`
                      : `🏆 ${match.team_b_name} won the match`;
                } else {
                  resultText = "Match Tied / Drawn";
                }
              } else {
                const tossWinnerName =
                  match.toss_winner_team_id === match.team_a_id
                    ? match.team_a_name
                    : match.team_b_name;
                resultText = match.toss_winner_team_id
                  ? `Toss won by ${tossWinnerName}`
                  : "Toss not decided";
              }

              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/matches/${match.id}`)}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-card-hover transition-all cursor-pointer shadow-sm relative overflow-hidden group flex flex-col h-full"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      {match.overs_limit} OVERS
                    </span>

                    {isOngoing && (
                      <div className="bg-destructive/15 text-destructive px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-destructive/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></span>{" "}
                        LIVE
                      </div>
                    )}
                    {(match.status === "upcoming" || !match.status) && (
                      <div className="bg-primary/15 text-primary px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-primary/20">
                        <Calendar className="w-3 h-3" /> UPCOMING
                      </div>
                    )}
                    {isCompleted && (
                      <div className="bg-border text-muted-foreground px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        COMPLETED
                      </div>
                    )}
                  </div>

                  {/* Teams and Real Scores */}
                  <div className="space-y-4 mb-5">
                    {/* Team A */}
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold text-foreground text-lg group-hover:text-primary transition-colors truncate max-w-[60%]"
                        title={match.team_a_name}
                      >
                        {match.team_a_name}
                      </span>
                      <div className="text-right flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-foreground">
                          {match.team_a_score || 0}
                          <span className="text-sm text-muted-foreground font-medium">
                            /{match.team_a_wickets || 0}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({formatOvers(match.team_a_balls)} ov)
                        </span>
                      </div>
                    </div>
                    {/* Team B */}
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold text-foreground text-lg group-hover:text-primary transition-colors truncate max-w-[60%]"
                        title={match.team_b_name}
                      >
                        {match.team_b_name}
                      </span>
                      <div className="text-right flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-foreground">
                          {match.team_b_score || 0}
                          <span className="text-sm text-muted-foreground font-medium">
                            /{match.team_b_wickets || 0}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          ({formatOvers(match.team_b_balls)} ov)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Result / Toss */}
                  <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    {isCompleted ? (
                      <span className="text-primary font-bold uppercase tracking-wide">
                        {resultText}
                      </span>
                    ) : isOngoing ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5 text-destructive font-medium">
                          <Activity className="w-3.5 h-3.5" /> Match in progress
                        </span>
                        <span>{resultText}</span>
                      </div>
                    ) : (
                      <span>{resultText}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION: MANUAL LOAD MORE BUTTON */}
          {hasMore && filteredMatches.length > 0 && activeTab === "all" && (
            <div className="flex justify-center mt-4 mb-12">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isFetchingPage}
                className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-full text-foreground hover:bg-card-hover hover:border-primary/50 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
              >
                {isFetchingPage ? "Loading..." : "Load More Matches"}
                {!isFetchingPage && <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default MatchesListPage;
