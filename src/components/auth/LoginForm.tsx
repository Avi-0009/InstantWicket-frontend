import { useState } from "react";
import {
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../../store/useAuthStore";
import { Login, ResetPassword } from "../../Api/Auth";
import toast from "react-hot-toast";

interface LoginFormProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

// 🔥 1. Define Zod Schemas for Phone and Password
const phoneSchema = z
  .string()
  .regex(
    /^[1-9]\d{9}$/,
    "Phone number must be exactly 10 digits and cannot start with 0.",
  );

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(16, "Password cannot exceed 16 characters.");

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const LoginForm = ({ isSignUp, setIsSignUp }: LoginFormProps) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // --- Login State ---
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- Forgot Password State ---
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) {
      val = val.slice(1);
    }
    if (val.length > 10) {
      val = val.slice(0, 10);
    }
    setLoginPhone(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // 🔥 Validate Phone
    const phoneValidation = phoneSchema.safeParse(loginPhone);
    if (!phoneValidation.success) {
      setLoginError(phoneValidation.error.issues[0].message);
      return;
    }

    // 🔥 Validate Password
    const passwordValidation = passwordSchema.safeParse(loginPassword);
    if (!passwordValidation.success) {
      setLoginError(passwordValidation.error.issues[0].message);
      return;
    }

    try {
      setIsLoggingIn(true);
      const data = await Login(loginPhone, loginPassword);
      login(
        {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone_no,
          avatar:
            data.user.avatar ||
            data.user.profile_picture ||
            getInitials(data.user.name),
        },
        data.token,
      );
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      setLoginError(err.response?.data?.error || "Invalid credentials.");
      toast.error("Failed to login, Please try again!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (forgotStep === 1) {
      const phoneValidation = phoneSchema.safeParse(loginPhone);
      if (!phoneValidation.success) {
        setForgotError(phoneValidation.error.issues[0].message);
        return;
      }
      setForgotStep(2);
    } else if (forgotStep === 2) {
      if (otp !== "8080") {
        setForgotError("Invalid OTP. Try 8080.");
        toast.error("OTP is incorrect, Please try again!");
        return;
      }
      setForgotStep(3);
    } else if (forgotStep === 3) {
      // 🔥 Validate New Password with Zod
      const passwordValidation = passwordSchema.safeParse(newPassword);
      if (!passwordValidation.success) {
        setForgotError(passwordValidation.error.issues[0].message);
        toast.error(passwordValidation.error.issues[0].message);
        return;
      }

      try {
        setIsResetting(true);
        await ResetPassword(loginPhone, newPassword);
        setForgotSuccess("Password updated successfully!");
        toast.success("Password updated successfully!");

        setTimeout(() => {
          setIsForgotMode(false);
          setForgotStep(1);
          setOtp("");
          setNewPassword("");
          setLoginPassword("");
          setForgotSuccess("");
          setShowNewPassword(false);
        }, 2000);
      } catch (err: any) {
        setForgotError(
          err.response?.data?.error || "Failed to reset password.",
        );
        toast.error("Try again!");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const resetForgotState = () => {
    setIsForgotMode(false);
    setForgotStep(1);
    setOtp("");
    setNewPassword("");
    setForgotError("");
    setLoginError("");
    setShowNewPassword(false);
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD RENDER
  // ---------------------------------------------------------------------------
  if (isForgotMode) {
    return (
      <div
        className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${
          isSignUp
            ? "opacity-0 invisible scale-95"
            : "opacity-100 visible scale-100 delay-200"
        }`}
      >
        <button
          onClick={resetForgotState}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Reset Password
          </h1>
          <p className="text-muted-foreground text-sm">
            {forgotStep === 1 && "Enter your phone number to receive an OTP."}
            {forgotStep === 2 && `Enter the 4-digit OTP sent to ${loginPhone}`}
            {forgotStep === 3 && "Create a secure new password."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleForgotFlow}>
          {forgotStep === 1 && (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                required
                value={loginPhone}
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                className="flex h-11 w-full rounded-md border border-border bg-transparent pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
            </div>
          )}

          {forgotStep === 2 && (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="○ ○ ○ ○"
                className="flex h-14 w-full rounded-md border border-border bg-transparent pl-12 pr-4 py-2 text-2xl text-center tracking-[0.75em] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono"
              />
            </div>
          )}

          {forgotStep === 3 && (
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-300">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showNewPassword ? "text" : "password"}
                required
                maxLength={16} // 🔥 Hardware limit
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="flex h-11 w-full rounded-md border border-border bg-transparent pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {forgotError && (
            <div className="text-destructive text-sm font-medium px-1 animate-in fade-in">
              {forgotError}
            </div>
          )}
          {forgotSuccess && (
            <div className="text-primary text-sm font-medium px-1 animate-in fade-in">
              {forgotSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isResetting || (forgotStep === 3 && forgotSuccess !== "")}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full mt-2"
          >
            {isResetting
              ? "Updating..."
              : forgotStep === 3
                ? "Update Password"
                : "Next Step"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STANDARD LOGIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${
        isSignUp
          ? "opacity-0 invisible scale-95"
          : "opacity-100 visible scale-100 delay-200"
      }`}
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1.5">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to access your matches
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        {/* Phone Input */}
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            required
            value={loginPhone}
            onChange={handlePhoneChange}
            placeholder="Phone Number"
            className="flex h-11 w-full rounded-md border border-border bg-transparent pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type={showLoginPassword ? "text" : "password"}
            required
            maxLength={16} // 🔥 Hardware limit
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            className="flex h-11 w-full rounded-md border border-border bg-transparent pl-10 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            {showLoginPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="text-destructive text-sm font-medium px-1">
            {loginError}
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className=" text-black inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full mt-2"
        >
          {isLoggingIn ? "Signing In..." : "Sign In"}{" "}
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </form>

      {/* Forgot Password Link - CENTERED BELOW SIGN IN */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setIsForgotMode(true)}
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
        >
          Forgot password?
        </button>
      </div>

      {/* Mobile Sign Up Link */}
      <div className="mt-4 flex justify-center text-sm text-muted-foreground md:hidden">
        Don't have an account?{" "}
        <button
          onClick={() => setIsSignUp(true)}
          className="text-primary font-medium hover:underline underline-offset-4 ml-1"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
