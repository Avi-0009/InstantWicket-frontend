import { useState } from "react";
import { Phone, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Register } from "../../Api/Auth";
import toast from "react-hot-toast";

interface SignUpFormProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
}

// 🔥 1. Define Zod Schemas for all fields
const nameSchema = z
  .string()
  .min(1, "Full name is required.")
  .max(20, "Name cannot exceed 20 characters.")
  .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces.");

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

const SignUpForm = ({ isSignUp, setIsSignUp }: SignUpFormProps) => {
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 2. Real-time Input Restrictors
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[0-9]/g, ""); // Strip out any numbers
    if (val.length > 20) {
      val = val.slice(0, 20); // Limit to 20 chars
    }
    setRegName(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.startsWith("0")) {
      val = val.slice(1); // Prevent leading 0
    }
    if (val.length > 10) {
      val = val.slice(0, 10); // Limit to exactly 10 digits
    }
    setRegPhone(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length > 16) {
      val = val.slice(0, 16); // Limit to exactly 16 characters
    }
    setRegPassword(val);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    // 🔥 3. Validate ALL fields with Zod before submitting
    const nameValidation = nameSchema.safeParse(regName);
    if (!nameValidation.success) {
      setRegError(nameValidation.error.issues[0].message);
      return;
    }

    const phoneValidation = phoneSchema.safeParse(regPhone);
    if (!phoneValidation.success) {
      setRegError(phoneValidation.error.issues[0].message);
      return;
    }

    const passwordValidation = passwordSchema.safeParse(regPassword);
    if (!passwordValidation.success) {
      setRegError(passwordValidation.error.issues[0].message);
      return;
    }

    try {
      setIsRegistering(true);
      await Register(regName, regPhone, regPassword);

      // Show success message and transition to Login form
      setRegSuccess("Account created successfully! Please sign in.");
      toast.success("Account created successfully!");

      // Clear form
      setRegName("");
      setRegPhone("");
      setRegPassword("");
      setShowPassword(false); // Reset visibility

      // Switch to sign-in view after a short delay
      setTimeout(() => {
        setIsSignUp(false);
        setRegSuccess("");
      }, 2000);
    } catch (err: any) {
      setRegError(err.response?.data?.error || "Registration failed.");
      toast.error("Unable to create account, Registration failed!");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 md:p-12 transition-all duration-500 ${!isSignUp ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100 delay-200"}`}
    >
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1.5">
          Create Account
        </h1>
        <p className="text-muted-foreground text-sm">
          Join us and start managing your matches
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSignUp}>
        {/* Full Name Input */}
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            required
            maxLength={20}
            value={regName}
            onChange={handleNameChange} // 🔥 Updated onChange
            placeholder="Full Name"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Phone Input */}
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            required
            maxLength={10}
            value={regPhone}
            onChange={handlePhoneChange}
            placeholder="Phone Number"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            required
            maxLength={16}
            value={regPassword}
            onChange={handlePasswordChange} // 🔥 Updated onChange
            placeholder="Password"
            className="w-full bg-card-hover border border-border rounded-xl py-3 pl-11 pr-10 text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
          {/* Toggle Visibility Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {regError && (
          <div className="text-destructive text-xs font-semibold px-1">
            {regError}
          </div>
        )}

        {/* Success Message */}
        {regSuccess && (
          <div className="text-primary text-xs font-semibold px-1">
            {regSuccess}
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
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;
