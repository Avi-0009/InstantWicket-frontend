import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  // Make backUrl optional. If not provided, it defaults to the Dashboard ("/")
  backUrl?: string;
}

const PageHeader = ({ title, backUrl = "/" }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={() => navigate(backUrl)}
        className="p-2 bg-card border border-border rounded-full hover:bg-card-hover hover:border-primary/50 transition-all shadow-lg text-foreground"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <h1 className="text-[28px] font-bold text-foreground">{title}</h1>
    </div>
  );
};
export default PageHeader;
