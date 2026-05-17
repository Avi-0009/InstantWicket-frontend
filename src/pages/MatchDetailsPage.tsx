import { useState } from "react";
import { useParams } from "react-router-dom";
import { Swords, Calendar } from "lucide-react";
import PageHeader from "../components/common/PageHeader";

// Helper function to convert total legal balls to overs (e.g., 94 balls -> 15.4 overs)
const getOvers = (legalBalls: number) => {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
};

const MatchDetailsPage = () => {
  const { id } = useParams();

  // We use activeInning to flip between Innings 1 and Innings 2 scorecards
  const [activeInning, setActiveInning] = useState<1 | 2>(1);

  // MOCK DATA: Simulating API response based on what list item you clicked
  const status = id === "3" ? "upcoming" : id === "2" ? "completed" : "ongoing";

  const mockMatchInfo = {
    id: id || "match-123",
    status: status,
    teamA: "Warriors",
    teamB: "Titans",
    toss:
      status === "upcoming" ? "" : "Titans won the toss and elected to bowl",
    date: "17 May 2026",
    innings:
      status === "upcoming"
        ? []
        : [
            {
              innings_no: 1,
              batting_team: "Warriors",
              bowling_team: "Titans",
              total_runs: 184,
              total_wickets: 6,
              total_extras: 12,
              legal_balls: 120, // 20 Overs
              status: "completed",
            },
            // Conditionally add second innings if it's completed or we're on the ongoing mock match
            ...(status === "completed" || (status === "ongoing" && id === "1")
              ? [
                  {
                    innings_no: 2,
                    batting_team: "Titans",
                    bowling_team: "Warriors",
                    total_runs: 142,
                    total_wickets: 4,
                    total_extras: 8,
                    legal_balls: 94, // 15.4 Overs
                    target_runs: 185,
                    status: status === "completed" ? "completed" : "ongoing",
                  },
                ]
              : []),
          ],
  };

  const currentInningData = mockMatchInfo.innings.find(
    (i) => i.innings_no === activeInning,
  );

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-[#061311] min-h-screen">
      <PageHeader title="Match Center" backUrl="/matches" />

      {/* Match Summary Hero Card */}
      <div className="bg-gradient-to-br from-[#0B1F1B] to-[#061311] border border-[#1B3530] rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <span className="px-3 py-1 bg-[#1B3530] text-[#9FB7B2] rounded-full text-[10px] font-bold uppercase tracking-widest">
            {mockMatchInfo.status === "upcoming"
              ? "Match Not Started"
              : mockMatchInfo.toss}
          </span>
        </div>

        <div className="flex justify-between items-center px-2 md:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#F4FFFD] mb-2">
              {mockMatchInfo.teamA}
            </h2>
            {mockMatchInfo.status !== "upcoming" &&
              mockMatchInfo.innings[0] && (
                <p className="text-[#0FAF9A] text-xl font-bold">
                  {mockMatchInfo.innings[0].total_runs}/
                  {mockMatchInfo.innings[0].total_wickets}
                  <span className="text-sm text-[#9FB7B2] font-normal ml-1">
                    ({getOvers(mockMatchInfo.innings[0].legal_balls)})
                  </span>
                </p>
              )}
          </div>

          <div className="text-[#9FB7B2] font-bold text-lg px-4">VS</div>

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#F4FFFD] mb-2">
              {mockMatchInfo.teamB}
            </h2>
            {mockMatchInfo.status !== "upcoming" &&
              mockMatchInfo.innings[1] && (
                <p className="text-[#0FAF9A] text-xl font-bold">
                  {mockMatchInfo.innings[1].total_runs}/
                  {mockMatchInfo.innings[1].total_wickets}
                  <span className="text-sm text-[#9FB7B2] font-normal ml-1">
                    ({getOvers(mockMatchInfo.innings[1].legal_balls)})
                  </span>
                </p>
              )}
          </div>
        </div>

        {/* Dynamic Status Footer */}
        {mockMatchInfo.status === "ongoing" && mockMatchInfo.innings[1] && (
          <div className="mt-6 text-center text-[#FF6B6B] font-bold text-sm bg-[#FF6B6B]/10 py-2 rounded-lg border border-[#FF6B6B]/20">
            {mockMatchInfo.teamB} need{" "}
            {mockMatchInfo.innings[1].target_runs! -
              mockMatchInfo.innings[1].total_runs}{" "}
            runs in {120 - mockMatchInfo.innings[1].legal_balls} balls
          </div>
        )}
      </div>

      {/* Innings Logic View */}
      {mockMatchInfo.status === "upcoming" ? (
        // UPCOMING MATCH STATE
        <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-[#9FB7B2] mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#F4FFFD] mb-2">
            Match Starts Soon
          </h3>
          <p className="text-[#9FB7B2]">
            Scheduled for {mockMatchInfo.date}. Innings data will appear here
            once the toss happens.
          </p>
        </div>
      ) : (
        // LIVE OR COMPLETED MATCH STATE
        <>
          {/* Innings Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveInning(1)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                activeInning === 1
                  ? "bg-[#0FAF9A] text-[#061311]"
                  : "bg-[#0B1F1B] text-[#9FB7B2] border border-[#1B3530]"
              }`}
            >
              1st Innings: {mockMatchInfo.innings[0]?.batting_team}
            </button>
            <button
              onClick={() => setActiveInning(2)}
              disabled={!mockMatchInfo.innings[1]} // Disable if 2nd innings hasn't started yet
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                activeInning === 2
                  ? "bg-[#0FAF9A] text-[#061311]"
                  : "bg-[#0B1F1B] text-[#9FB7B2] border border-[#1B3530] disabled:opacity-50"
              }`}
            >
              2nd Innings:{" "}
              {mockMatchInfo.innings[1]
                ? mockMatchInfo.innings[1].batting_team
                : "Yet to bat"}
            </button>
          </div>

          {/* Innings Stats Block */}
          {currentInningData ? (
            <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1B3530]">
                <div className="flex items-center gap-2 text-[#0FAF9A] font-bold">
                  <Swords className="w-5 h-5" />{" "}
                  {currentInningData.batting_team} Batting
                </div>
                {currentInningData.status === "completed" && (
                  <span className="text-[10px] bg-[#1B3530] text-[#9FB7B2] px-2 py-1 rounded font-bold">
                    INNINGS COMPLETED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#9FB7B2] font-bold uppercase mb-1">
                    Score
                  </p>
                  <p className="text-2xl font-black text-[#F4FFFD]">
                    {currentInningData.total_runs}/
                    {currentInningData.total_wickets}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9FB7B2] font-bold uppercase mb-1">
                    Overs
                  </p>
                  <p className="text-2xl font-black text-[#F4FFFD]">
                    {getOvers(currentInningData.legal_balls)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9FB7B2] font-bold uppercase mb-1">
                    Extras
                  </p>
                  <p className="text-2xl font-black text-[#F4FFFD]">
                    {currentInningData.total_extras}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#9FB7B2] font-bold uppercase mb-1">
                    Run Rate
                  </p>
                  <p className="text-2xl font-black text-[#F4FFFD]">
                    {currentInningData.legal_balls > 0
                      ? (
                          currentInningData.total_runs /
                          (currentInningData.legal_balls / 6)
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>

              {currentInningData.target_runs && (
                <div className="mt-4 p-3 bg-[#1B3530]/50 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-bold text-[#9FB7B2]">
                    Target
                  </span>
                  <span className="text-lg font-black text-[#0FAF9A]">
                    {currentInningData.target_runs}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold text-[#F4FFFD] mb-2">
                Innings Not Started
              </h3>
              <p className="text-[#9FB7B2]">
                This innings has not commenced yet.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default MatchDetailsPage;
