export default function OverTimeline() {
  const balls = [
    { type: "dot", label: "•" },
    { type: "boundary", label: "4" },
    { type: "boundary", label: "6" },
    { type: "run", label: "1" },
    { type: "wicket", label: "W" },
    { type: "empty", label: "—" },
  ];

  return (
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-2xl p-4 shadow-lg">
      <div className="text-[10px] text-[#9FB7B2] font-semibold uppercase tracking-wider mb-3">
        This Over
      </div>
      <div className="flex gap-2 items-center">
        {balls.map((ball, idx) => (
          <div
            key={idx}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm
              ${ball.type === "dot" ? "bg-[#0D2420] text-[#9FB7B2] border border-[#1B3530]" : ""}
              ${ball.type === "boundary" ? "bg-[#0FAF9A] text-[#061311]" : ""}
              ${ball.type === "run" ? "bg-[#0D2420] text-[#F4FFFD] border border-[#1B3530]" : ""}
              ${ball.type === "wicket" ? "bg-[#FF6B6B] text-[#F4FFFD]" : ""}
              ${ball.type === "empty" ? "bg-transparent text-[#1B3530] border border-[#1B3530]/50 border-dashed" : ""}
            `}
          >
            {ball.label}
          </div>
        ))}
      </div>
    </div>
  );
}
