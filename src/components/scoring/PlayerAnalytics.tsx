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
} from "chart.js";
import { PolarArea, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

ChartJS.defaults.color = "#9FB7B2";

interface Props {
  stats: any; // Receives the player stats object
}

const PlayerAnalytics = ({ stats }: Props) => {
  const analytics = useMemo(() => {
    if (!stats) return null;

    // --- RUN COMPOSITION (Polar Chart) ---
    const fours = stats.career_fours || 0;
    const sixes = stats.career_sixes || 0;
    const totalRuns = stats.career_runs || stats.runs_scored || 0;

    const boundaryRunsFours = fours * 4;
    const boundaryRunsSixes = sixes * 6;
    const runningRuns = Math.max(
      0,
      totalRuns - boundaryRunsFours - boundaryRunsSixes,
    );

    // --- PLAYER SKILL ATTRIBUTES (Radar Chart 0-100 Scale) ---
    const matches = stats.career_matches || stats.matches_played || 1;
    const strikeRate = stats.strike_rate || 0;
    const economy = stats.economy || 10;
    const wickets = stats.career_wickets || 0;
    const fielding =
      (stats.career_catches || 0) +
      (stats.career_runouts || 0) +
      (stats.career_stumpings || 0);

    // Calculate dynamic 0-100 attributes
    const battingIndex = Math.min(
      100,
      (totalRuns / matches) * 2 + strikeRate / 2,
    );
    const bowlingIndex = Math.min(
      100,
      wickets * 5 + Math.max(0, 100 - economy * 7),
    );
    const fieldingIndex = Math.min(100, fielding * 15);
    const powerIndex = Math.min(100, sixes * 8 + fours * 3 + strikeRate / 3);
    const experienceIndex = Math.min(100, matches * 5);

    return {
      polarData: [runningRuns, boundaryRunsFours, boundaryRunsSixes],
      // Give a minimum of 10 to every stat so the web never completely collapses to invisible
      radarData: [
        battingIndex,
        bowlingIndex,
        fieldingIndex,
        powerIndex,
        experienceIndex,
      ].map((v) => Math.max(10, v)),
    };
  }, [stats]);

  // Don't show charts if they haven't played a match yet
  if (
    !analytics ||
    (stats?.career_matches === 0 && stats?.matches_played === 0)
  )
    return null;

  // --- RADAR CHART CONFIG ---
  const radarData = {
    labels: ["Batting", "Bowling", "Fielding", "Power", "Experience"],
    datasets: [
      {
        label: "Player Profile",
        data: analytics.radarData,
        backgroundColor: "rgba(15, 175, 154, 0.4)", // Primary Color (#0FAF9A)
        borderColor: "rgba(15, 175, 154, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(15, 175, 154, 1)",
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
        ticks: { display: false, max: 100 }, // Lock scale to 100 max
      },
    },
    plugins: { legend: { display: false } }, // Hide legend for cleaner look
  };

  // --- POLAR CHART CONFIG ---
  const polarData = {
    labels: ["Running (1s, 2s, 3s)", "Fours", "Sixes"],
    datasets: [
      {
        data: analytics.polarData,
        backgroundColor: [
          "rgba(15, 175, 154, 0.7)", // Primary (Running)
          "rgba(59, 130, 246, 0.7)", // Blue (Fours)
          "rgba(168, 85, 247, 0.7)", // Purple (Sixes)
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
    <div className="mb-10 animate-fade-in space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 px-1">
        Career Visualized
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RADAR CHART */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition-colors">
          <h4 className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold text-center mb-4">
            Skill Attributes
          </h4>
          <div className="h-55 w-full">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* POLAR CHART */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 transition-colors">
          <h4 className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold text-center mb-4">
            Run Scoring Breakdown
          </h4>
          <div className="h-55 w-full flex justify-center">
            <PolarArea data={polarData} options={polarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAnalytics;
