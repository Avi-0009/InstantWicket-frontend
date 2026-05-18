import { Eye, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

interface AuthOverlayProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

export default function AuthOverlay({
  isSignUp,
  setIsSignUp,
}: AuthOverlayProps) {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuthStore();

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div
      className={`absolute bottom-0 md:top-0 right-0 w-full md:w-1/2 h-[40%] md:h-full bg-gradient-to-br from-primary to-primary-hover flex flex-col items-center justify-center text-center p-8 transition-transform duration-700 ease-in-out z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] ${
        isSignUp ? "md:-translate-x-full" : "translate-x-0"
      }`}
    >
      <Trophy className="w-16 h-16 text-background mb-6 hidden md:block" />
      <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
        {isSignUp ? "Welcome Back!" : "Hello, Scorer!"}
      </h2>
      <p className="text-card font-medium max-w-sm mb-8 text-sm md:text-base hidden md:block">
        {isSignUp
          ? "To keep connected with your matches, please login with your personal info."
          : "Register with your personal details to start scoring live matches instantly."}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[240px]">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="hidden md:block w-full py-3 rounded-xl border-2 border-background text-background hover:bg-background hover:text-primary transition-colors font-bold tracking-wide"
        >
          {isSignUp ? "SWITCH TO SIGN IN" : "SWITCH TO SIGN UP"}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-background/20"></div>
          <span className="flex-shrink-0 mx-4 text-background/70 text-xs font-bold">
            OR
          </span>
          <div className="flex-grow border-t border-background/20"></div>
        </div>

        <button
          onClick={handleGuestAccess}
          className="w-full py-3 rounded-xl bg-background text-primary hover:bg-card transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <Eye className="w-4 h-4" /> View Live Scores
        </button>
      </div>
    </div>
  );
}
