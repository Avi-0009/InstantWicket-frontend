// src/components/matches/InningsDetails.tsx
import { Swords } from "lucide-react";
import { getOvers } from "../../utils/helpers";

interface InningsDetailsProps {
  matchInfo: any; // Using any for mock brevity, replace with strict type later
  activeInning: 1 | 2;
  setActiveInning: (inning: 1 | 2) => void;
}

export default function InningsDetails({
  matchInfo,
  activeInning,
  setActiveInning,
}: InningsDetailsProps) {
  const currentInningData = matchInfo.innings.find(
    (i: any) => i.innings_no === activeInning,
  );

  return (
    <>
      {/* Innings Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveInning(1)}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeInning === 1
              ? "bg-primary text-background"
              : "bg-card text-muted-foreground border border-border"
          }`}
        >
          1st Innings: {matchInfo.innings[0]?.batting_team}
        </button>
        <button
          onClick={() => setActiveInning(2)}
          disabled={!matchInfo.innings[1]}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeInning === 2
              ? "bg-primary text-background"
              : "bg-card text-muted-foreground border border-border disabled:opacity-50"
          }`}
        >
          2nd Innings:{" "}
          {matchInfo.innings[1]
            ? matchInfo.innings[1].batting_team
            : "Yet to bat"}
        </button>
      </div>

      {/* Innings Stats Block */}
      {currentInningData ? (
        <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Swords className="w-5 h-5" /> {currentInningData.batting_team}{" "}
              Batting
            </div>
            {currentInningData.status === "completed" && (
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded font-bold">
                INNINGS COMPLETED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">
                Score
              </p>
              <p className="text-2xl font-black text-foreground">
                {currentInningData.total_runs}/{currentInningData.total_wickets}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">
                Overs
              </p>
              <p className="text-2xl font-black text-foreground">
                {getOvers(currentInningData.legal_balls)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">
                Extras
              </p>
              <p className="text-2xl font-black text-foreground">
                {currentInningData.total_extras}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">
                Run Rate
              </p>
              <p className="text-2xl font-black text-foreground">
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
            <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">
                Target
              </span>
              <span className="text-lg font-black text-primary">
                {currentInningData.target_runs}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Innings Not Started
          </h3>
          <p className="text-muted-foreground">
            This innings has not commenced yet.
          </p>
        </div>
      )}
    </>
  );
}
