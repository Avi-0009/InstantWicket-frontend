import { useState } from "react";
import { Phone, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Login } from "../../Api/Auth";

interface LoginFormProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function LoginForm({ isSignUp, setIsSignUp }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      setIsLoggingIn(true);
      const data = await Login(loginPhone, loginPassword);

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

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${
        isSignUp
          ? "opacity-0 invisible scale-95"
          : "opacity-100 visible scale-100 delay-200"
      }`}
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to access your matches
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            required
            value={loginPhone}
            onChange={(e) => setLoginPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {loginError && (
          <div className="text-destructive text-xs font-semibold px-1">
            {loginError}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-background transition-colors font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
        >
          {isLoggingIn ? "Signing In..." : "Sign In"}{" "}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground md:hidden">
        Don't have an account?{" "}
        <button
          onClick={() => setIsSignUp(true)}
          className="text-primary font-semibold"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
