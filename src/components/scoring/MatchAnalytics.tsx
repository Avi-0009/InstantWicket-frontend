import { useMemo } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { PolarArea, Radar, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
);

ChartJS.defaults.color = "#9FB7B2";

interface MatchAnalyticsProps {
  matchData: any;
  scorecard: any[];
}

const MatchAnalytics = ({ matchData, scorecard }: MatchAnalyticsProps) => {
  // 🔥 CRUNCH THE ACTUAL DATA
  const analytics = useMemo(() => {
    if (!matchData || !scorecard) return null;

    const teamAPlayers = matchData.team_a_players?.map((p: any) => p.id) || [];
    const teamBPlayers = matchData.team_b_players?.map((p: any) => p.id) || [];

    let aFours = 0,
      aSixes = 0;
    let bFours = 0,
      bSixes = 0;

    // Extras are awarded TO a team, but bowled BY the opposing team
    let aExtrasReceived = 0;
    let bExtrasReceived = 0;

    scorecard.forEach((s: any) => {
      if (teamAPlayers.includes(s.player_id)) {
        aFours += s.fours || 0;
        aSixes += s.sixes || 0;
        // Team A bowlers concede extras to Team B
        bExtrasReceived += (s.wides || 0) + (s.no_balls || 0);
      } else if (teamBPlayers.includes(s.player_id)) {
        bFours += s.fours || 0;
        bSixes += s.sixes || 0;
        // Team B bowlers concede extras to Team A
        aExtrasReceived += (s.wides || 0) + (s.no_balls || 0);
      }
    });

    const aScore = matchData.team_a_score || 0;
    const aBalls = matchData.team_a_balls || 0;
    const bScore = matchData.team_b_score || 0;
    const bBalls = matchData.team_b_balls || 0;

    const aBoundaryRuns = aFours * 4 + aSixes * 6;
    const aRunning = Math.max(0, aScore - aBoundaryRuns - aExtrasReceived);

    const bBoundaryRuns = bFours * 4 + bSixes * 6;
    const bRunning = Math.max(0, bScore - bBoundaryRuns - bExtrasReceived);

    // WORM CHART SIMULATOR
    // Builds a cumulative array based on RR since we don't have a ball-by-ball database timeline
    const maxOvers = Math.max(Math.ceil(aBalls / 6), Math.ceil(bBalls / 6), 1);
    const labels = Array.from({ length: maxOvers }, (_, i) => `Ov ${i + 1}`);

    const generateWorm = (score: number, balls: number) => {
      const oversPlayed = Math.ceil(balls / 6);
      const rr = balls > 0 ? score / balls : 0;
      return Array.from({ length: maxOvers }, (_, i) => {
        if (i >= oversPlayed) return null; // Line stops if innings ended early
        if (i === oversPlayed - 1) return score; // Exact final score
        return Math.round(rr * (i + 1) * 6); // Trendline
      });
    };

    return {
      teamAName: matchData.team_a_name || "Team A",
      teamBName: matchData.team_b_name || "Team B",
      radarDataA: [aScore, aBalls, aBoundaryRuns, aRunning, aExtrasReceived],
      radarDataB: [bScore, bBalls, bBoundaryRuns, bRunning, bExtrasReceived],
      polarData: [
        (aFours + bFours) * 4,
        (aSixes + bSixes) * 6,
        aRunning + bRunning,
        aExtrasReceived + bExtrasReceived,
      ],
      wormLabels: labels,
      wormA: generateWorm(aScore, aBalls),
      wormB: generateWorm(bScore, bBalls),
    };
  }, [matchData, scorecard]);

  if (!analytics) return null;

  // --- LINE CHART DATA ---
  const lineData = {
    labels: analytics.wormLabels,
    datasets: [
      {
        label: analytics.teamAName,
        data: analytics.wormA,
        borderColor: "rgba(15, 175, 154, 1)",
        backgroundColor: "rgba(15, 175, 154, 0.1)",
        borderWidth: 3,
        tension: 0.2,
        fill: true,
        spanGaps: false, // Stops the line when innings finishes
      },
      {
        label: analytics.teamBName,
        data: analytics.wormB,
        borderColor: "rgba(234, 179, 8, 1)",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 3,
        tension: 0.2,
        fill: true,
        spanGaps: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: "rgba(27, 53, 48, 0.3)" } },
      y: { grid: { color: "rgba(27, 53, 48, 0.5)" }, beginAtZero: true },
    },
    plugins: {
      legend: { position: "top" as const },
      tooltip: { mode: "index" as const, intersect: false },
    },
  };

  // --- RADAR CHART DATA ---
  const radarData = {
    labels: [
      "Total Runs",
      "Balls Faced",
      "Boundary Runs",
      "Running Runs",
      "Extras Received",
    ],
    datasets: [
      {
        label: analytics.teamAName,
        data: analytics.radarDataA,
        backgroundColor: "rgba(15, 175, 154, 0.4)",
        borderColor: "rgba(15, 175, 154, 1)",
        borderWidth: 2,
      },
      {
        label: analytics.teamBName,
        data: analytics.radarDataB,
        backgroundColor: "rgba(234, 179, 8, 0.4)",
        borderColor: "rgba(234, 179, 8, 1)",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: "rgba(27, 53, 48, 0.5)" },
        grid: { color: "rgba(27, 53, 48, 0.5)" },
        pointLabels: {
          font: { size: 10, weight: "bold" as const },
          color: "#F4FFFD",
        },
        ticks: { display: false },
      },
    },
    plugins: { legend: { position: "bottom" as const } },
  };

  // --- POLAR AREA CHART DATA ---
  const polarData = {
    labels: ["Fours", "Sixes", "Running (1s, 2s, 3s)", "Extras"],
    datasets: [
      {
        data: analytics.polarData,
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // Blue (Fours)
          "rgba(168, 85, 247, 0.7)", // Purple (Sixes)
          "rgba(15, 175, 154, 0.7)", // Primary (Running)
          "rgba(234, 179, 8, 0.7)", // Yellow (Extras)
        ],
        borderWidth: 1,
        borderColor: "#0B1F1B",
      },
    ],
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: "rgba(27, 53, 48, 0.5)" },
        ticks: { display: false },
      },
    },
    plugins: { legend: { position: "right" as const } },
  };

  return (
    <div className="mt-8 animate-fade-in space-y-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
        Match Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LINE CHART (WORM) */}
        <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-4 shadow-sm relative">
          <h4 className="text-foreground text-sm font-bold text-center mb-1">
            Run Rate Progression
          </h4>
          <p className="text-[10px] text-muted-foreground text-center mb-3 italic">
            *Trendline based on average run rate
          </p>
          <div className="h-70 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* RADAR CHART */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h4 className="text-foreground text-sm font-bold text-center mb-4">
            Team Comparison
          </h4>
          <div className="h-62.5 w-full">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* POLAR CHART */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h4 className="text-foreground text-sm font-bold text-center mb-4">
            Match Run Composition
          </h4>
          <div className="h-62.5 w-full flex justify-center">
            <PolarArea data={polarData} options={polarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalytics;
