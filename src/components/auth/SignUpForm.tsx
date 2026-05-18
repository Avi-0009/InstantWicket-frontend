import { useState } from "react";
import { Phone, Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Register } from "../../Api/Auth";

interface SignUpFormProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function SignUpForm({ isSignUp, setIsSignUp }: SignUpFormProps) {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    try {
      setIsRegistering(true);
      const data = await Register(regName, regPhone, regPassword);

      login(
        {
          id: data.user?.id || "temp-id",
          name: regName,
          phone: regPhone,
          avatar: getInitials(regName),
        },
        data.token || "",
      );

      navigate("/");
    } catch (err: any) {
      setRegError(err.response?.data?.error || "Registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${
        !isSignUp
          ? "opacity-0 invisible scale-95"
          : "opacity-100 visible scale-100 delay-200"
      }`}
    >
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create Account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start scoring like a professional
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSignUp}>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            required
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="Full Name"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            required
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            required
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {regError && (
          <div className="text-destructive text-xs font-semibold px-1">
            {regError}
          </div>
        )}

        <button
          type="submit"
          disabled={isRegistering}
          className="w-full py-3 mt-2 rounded-xl bg-primary hover:bg-primary-hover text-background transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isRegistering ? "Creating Account..." : "Create Account"}{" "}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground md:hidden">
        Already have an account?{" "}
        <button
          onClick={() => setIsSignUp(false)}
          className="text-primary font-semibold"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
