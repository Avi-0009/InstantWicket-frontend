// src/pages/MatchDetailsPage.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import MatchSummaryHero from "../components/matches/MatchSummaryHero";
import InningsDetails from "../components/matches/InningsDetails";

const MatchDetailsPage = () => {
  const { id } = useParams();
  const [activeInning, setActiveInning] = useState<1 | 2>(1);

  // MOCK DATA
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

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto w-full pb-24 bg-background min-h-screen">
      <PageHeader title="Match Center" backUrl="/matches" />

      {/* 1. Hero Card Component */}
      <MatchSummaryHero matchInfo={mockMatchInfo} />

      {/* 2. Logic for displaying upcoming state vs. innings data */}
      {mockMatchInfo.status === "upcoming" ? (
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Match Starts Soon
          </h3>
          <p className="text-muted-foreground">
            Scheduled for {mockMatchInfo.date}. Innings data will appear here
            once the toss happens.
          </p>
        </div>
      ) : (
        <InningsDetails
          matchInfo={mockMatchInfo}
          activeInning={activeInning}
          setActiveInning={setActiveInning}
        />
      )}
    </main>
  );
};

export default MatchDetailsPage;
