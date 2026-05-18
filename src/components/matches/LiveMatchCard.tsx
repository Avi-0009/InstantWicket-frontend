import { Play } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function LiveMatchCard() {
  return (
    <div className="bg-gradient-to-br from-card to-card-hover border border-border rounded-[14px] p-4 relative cursor-pointer hover:border-primary/40 transition-colors">
      {/* Live Badge */}
      <div className="absolute top-3 right-3 bg-destructive/15 text-destructive px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-destructive animate-pulse inline-block"></span>
        LIVE
      </div>

      {/* Teams and Main Score */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
          RCB
        </div>
        <div>
          <div className="font-semibold text-sm">Royal Challengers</div>
          <div className="text-2xl font-bold text-primary">
            186<span className="text-base text-muted-foreground">/4</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">18.3 ov</div>
          <div className="text-xs text-primary-hover">CRR: 10.1</div>
        </div>
      </div>

      {/* Match Situation / Target */}
      <div className="bg-card-hover rounded-lg p-2.5 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target: 201</span>
          <span className="text-primary-hover font-semibold">Need 15 runs</span>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden my-1.5">
          <div className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full w-[88%]"></div>
        </div>
        <div className="text-muted-foreground">RRR: 5.4 | 9 balls left</div>
      </div>

      {/* Players and Action Button */}
      <div className="flex justify-between items-center text-xs">
        <div>
          <div className="text-muted-foreground">Striker</div>
          <div className="font-medium">V. Kohli</div>
        </div>
        <div>
          <div className="text-muted-foreground">Bowler</div>
          <div className="font-medium">B. Kumar</div>
        </div>

        {/* UPDATED: NavLink instead of button with useNavigate */}
        <NavLink
          to="/match/live"
          onClick={(e) => e.stopPropagation()} // Prevents parent card clicks from firing if added later
          className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-muted-foreground flex items-center gap-1 hover:text-primary hover:border-primary transition-colors"
        >
          <Play className="w-3.5 h-3.5" /> Score
        </NavLink>
      </div>
    </div>
  );
}
