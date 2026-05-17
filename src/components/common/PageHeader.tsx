import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  // Make backUrl optional. If not provided, it defaults to the Dashboard ("/")
  backUrl?: string;
}

export default function PageHeader({ title, backUrl = "/" }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={() => navigate(backUrl)}
        className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD]"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="text-[28px] font-bold text-[#F4FFFD]">{title}</h1>
    </div>
  );
}
