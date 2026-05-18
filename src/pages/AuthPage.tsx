import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import SignUpForm from "../components/auth/SignUpForm";
import AuthOverlay from "../components/auth/AuthOverlay";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="relative w-full max-w-5xl min-h-[750px] md:min-h-[600px] bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:block">
        {/* Sliding Panel Container */}
        <div
          className={`absolute top-0 left-0 w-full md:w-1/2 h-[60%] md:h-full bg-card transition-transform duration-700 ease-in-out z-10 ${
            isSignUp ? "md:translate-x-full" : "translate-x-0"
          }`}
        >
          <LoginForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          <SignUpForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </div>

        {/* Overlay Container */}
        <AuthOverlay isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    </div>
  );
}
