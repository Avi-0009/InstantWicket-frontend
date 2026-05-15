import { useState } from "react";
import { Phone, Lock, User, ArrowRight, Eye, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Login, Register } from "../Api/Auth";

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { login, continueAsGuest } = useAuthStore();

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      setIsLoggingIn(true);
      const data = await Login(loginPhone, loginPassword);

      // Assumes your backend returns a 'token' string alongside the user object
      login(
        {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone_no,
          avatar: getInitials(data.user.name),
        },
        data.token,
      );

      navigate("/");
    } catch (err: any) {
      setLoginError(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    try {
      setIsRegistering(true);
      const data = await Register(regName, regPhone, regPassword);

      // Assumes registration also returns a token to log them in immediately
      login(
        {
          id: data.user?.id || "temp-id",
          name: regName,
          phone: regPhone,
          avatar: getInitials(regName),
        },
        data.token || "", // Fallback if your register endpoint doesn't return a token
      );

      navigate("/");
    } catch (err: any) {
      setRegError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#061311] flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="relative w-full max-w-5xl min-h-[750px] md:min-h-[600px] bg-[#0B1F1B] border border-[#1B3530] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:block">
        {/* Sliding Panel */}
        <div
          className={`absolute top-0 left-0 w-full md:w-1/2 h-[60%] md:h-full bg-[#0B1F1B] transition-transform duration-700 ease-in-out z-10 ${isSignUp ? "md:translate-x-full" : "translate-x-0"}`}
        >
          {/* Sign In Form */}
          <div
            className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${isSignUp ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100 delay-200"}`}
          >
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#F4FFFD] mb-2">
                Welcome Back
              </h1>
              <p className="text-[#9FB7B2] text-sm">
                Sign in to access your matches
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB7B2]" />
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-[#0D2420] border border-[#1B3530] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F4FFFD] outline-none focus:border-[#0FAF9A] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB7B2]" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#0D2420] border border-[#1B3530] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F4FFFD] outline-none focus:border-[#0FAF9A] transition-colors"
                />
              </div>

              {loginError && (
                <div className="text-[#FF6B6B] text-xs font-semibold px-1">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-[#0FAF9A] hover:bg-[#19F0C1] text-[#061311] transition-colors font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {isLoggingIn ? "Signing In..." : "Sign In"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#9FB7B2] md:hidden">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-[#0FAF9A] font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Sign Up Form */}
          <div
            className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${!isSignUp ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100 delay-200"}`}
          >
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#F4FFFD] mb-2">
                Create Account
              </h1>
              <p className="text-[#9FB7B2] text-sm">
                Start scoring like a professional
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB7B2]" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#0D2420] border border-[#1B3530] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F4FFFD] outline-none focus:border-[#0FAF9A] transition-colors"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB7B2]" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-[#0D2420] border border-[#1B3530] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F4FFFD] outline-none focus:border-[#0FAF9A] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB7B2]" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#0D2420] border border-[#1B3530] rounded-xl py-3 pl-11 pr-4 text-sm text-[#F4FFFD] outline-none focus:border-[#0FAF9A] transition-colors"
                />
              </div>

              {regError && (
                <div className="text-[#FF6B6B] text-xs font-semibold px-1">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 mt-2 rounded-xl bg-[#0FAF9A] hover:bg-[#19F0C1] text-[#061311] transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isRegistering ? "Creating Account..." : "Create Account"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#9FB7B2] md:hidden">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#0FAF9A] font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Overlay Container */}
        <div
          className={`absolute bottom-0 md:top-0 right-0 w-full md:w-1/2 h-[40%] md:h-full bg-gradient-to-br from-[#0FAF9A] to-[#19F0C1] flex flex-col items-center justify-center text-center p-8 transition-transform duration-700 ease-in-out z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] ${isSignUp ? "md:-translate-x-full" : "translate-x-0"}`}
        >
          <Trophy className="w-16 h-16 text-[#061311] mb-6 hidden md:block" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#061311] mb-4">
            {isSignUp ? "Welcome Back!" : "Hello, Scorer!"}
          </h2>
          <p className="text-[#0B1F1B] font-medium max-w-sm mb-8 text-sm md:text-base hidden md:block">
            {isSignUp
              ? "To keep connected with your matches, please login with your personal info."
              : "Register with your personal details to start scoring live matches instantly."}
          </p>
          <div className="flex flex-col gap-4 w-full max-w-[240px]">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="hidden md:block w-full py-3 rounded-xl border-2 border-[#061311] text-[#061311] hover:bg-[#061311] hover:text-[#0FAF9A] transition-colors font-bold tracking-wide"
            >
              {isSignUp ? "SWITCH TO SIGN IN" : "SWITCH TO SIGN UP"}
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#061311]/20"></div>
              <span className="flex-shrink-0 mx-4 text-[#061311]/70 text-xs font-bold">
                OR
              </span>
              <div className="flex-grow border-t border-[#061311]/20"></div>
            </div>
            <button
              onClick={handleGuestAccess}
              className="w-full py-3 rounded-xl bg-[#061311] text-[#0FAF9A] hover:bg-[#0B1F1B] transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Eye className="w-4 h-4" /> View Live Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
