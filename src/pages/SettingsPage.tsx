import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Logout, api } from "../Api/Auth";
import { usePlayerStats } from "../hooks/usePlayerQueries";
import CustomDropdown from "../components/scoring/CustomDropdown";
import {
  LogOut,
  ChevronRight,
  User,
  ChevronLeft,
  Moon,
  Sun,
  UserCircle,
  ShieldCheck,
  Phone,
  Loader2,
  Edit2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const SettingsSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6 animate-fade-in">
    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
      {title}
    </h3>
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-colors">
      {children}
    </div>
  </div>
);

const SettingsMenuItem = ({
  icon: Icon,
  label,
  onClick,
  hideBorder = false,
  rightElement,
}: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 bg-transparent hover:bg-card-hover transition-colors ${
      !hideBorder ? "border-b border-border" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium text-sm text-foreground">{label}</span>
    </div>
    {rightElement ? (
      rightElement
    ) : (
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    )}
  </button>
);

const SettingsPage = () => {
  const { user, logout, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Fetch stats seamlessly using your custom TanStack hook
  const { data: playerStats, isLoading, refetch } = usePlayerStats(user?.id);

  // --- EDIT PROFILE STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    batting_style: "Right Hand Bat",
    bowling_style: "Right Arm Medium",
  });

  // Dropdown options for playing styles
  const battingOptions = [
    { id: "Right Hand Bat", name: "Right Hand Bat" },
    { id: "Left Hand Bat", name: "Left Hand Bat" },
  ];

  const bowlingOptions = [
    { id: "None", name: "None" },
    { id: "Right Arm Fast", name: "Right Arm Fast" },
    { id: "Right Arm Medium", name: "Right Arm Medium" },
    { id: "Right Arm Offbreak", name: "Right Arm Offbreak" },
    { id: "Right Arm Legbreak", name: "Right Arm Legbreak" },
    { id: "Left Arm Fast", name: "Left Arm Fast" },
    { id: "Left Arm Medium", name: "Left Arm Medium" },
    { id: "Left Arm Orthodox", name: "Left Arm Orthodox" },
    { id: "Left Arm Chinaman", name: "Left Arm Chinaman" },
  ];

  // Sync form data once playerStats are loaded
  useEffect(() => {
    if (user || playerStats) {
      setFormData({
        name: playerStats?.name || user?.name || "",
        phone: playerStats?.phone_no || user?.phone_no || user?.phone || "",
        batting_style: playerStats?.batting_style || "Right Hand Bat",
        bowling_style: playerStats?.bowling_style || "Right Arm Medium",
      });
    }
  }, [playerStats, user]);

  const handleLogout = async () => {
    try {
      await Logout();
      toast.success("User logged out successfully!");
    } catch (err) {
      console.error("Logout failed on server", err);
      toast.error("Failed to logout user!");
    } finally {
      logout();
      navigate("/auth");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Only send the fields we want to update
      await api.put("/auth/profile", formData);

      // 2. Merge existing user data with the NEW changes
      const updatedUser = {
        ...user,
        ...formData,
        phone_no: formData.phone, // Ensure the store uses the correct field name
      };

      // 3. Update the global store
      if (setUser && user) {
        setUser(updatedUser as any);
      }

      await refetch();
      toast.success("Profile updated!");
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <main className="p-4 md:p-6 max-w-2xl mx-auto w-full animate-fade-in pb-24 bg-background min-h-screen transition-colors duration-200 relative">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-card border border-border rounded-full hover:bg-card-hover hover:border-primary/50 transition-all shadow-sm text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold text-foreground">Settings</h1>
      </div>

      {/* OFFICIAL PLAYER CARD */}
      <div className="bg-linear-to-br from-card to-background p-8 rounded-3xl border border-border shadow-lg text-center mb-8 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10">
          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-0 right-0 p-2.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors shadow-sm"
            title="Edit Profile"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 bg-primary/10 border-2 border-primary/20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
            <UserCircle className="w-16 h-16 text-primary" />
          </div>

          <h2 className="text-2xl font-black text-foreground flex items-center justify-center gap-2">
            {playerStats?.name || user?.name}
            {isLoading && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-1 mb-6">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">
              Verified Player
            </p>
          </div>

          {/* Details Summary */}
          <div className="border-t border-border/50 pt-6 mt-2">
            {/* Phone Number */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Phone className="w-4 h-4" />
              <span className="font-medium text-sm tracking-wide">
                {playerStats?.phone_no ||
                  user?.phone_no ||
                  user?.phone ||
                  "No phone linked"}
              </span>
            </div>

            {/* Playing Styles */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex-1 max-w-35">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Batting Style
                </div>
                <div className="text-sm font-black text-foreground capitalize truncate">
                  {isLoading ? "..." : playerStats?.batting_style || "N/A"}
                </div>
              </div>

              <div className="w-px bg-border/60"></div>

              <div className="flex-1 max-w-35">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Bowling Style
                </div>
                <div className="text-sm font-black text-foreground capitalize truncate">
                  {isLoading ? "..." : playerStats?.bowling_style || "N/A"}
                </div>
              </div>
            </div>

            {/* 🔥 NEW: Career Stats Grid */}
            <div className="bg-background/50 rounded-2xl p-4 border border-border/50 shadow-inner mt-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Matches
                  </div>
                  <div className="text-sm font-black text-foreground">
                    {playerStats?.career_matches || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Runs
                  </div>
                  <div className="text-sm font-black text-foreground">
                    {playerStats?.career_runs || 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    SR
                  </div>
                  <div className="text-sm font-black text-primary">
                    {playerStats?.strike_rate?.toFixed(1) || "0.0"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    ECO
                  </div>
                  <div className="text-sm font-black text-destructive">
                    {playerStats?.economy?.toFixed(1) || "0.0"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS SECTIONS */}
      <SettingsSection title="Account">
        <SettingsMenuItem
          icon={User}
          label="Personal Information"
          onClick={() => setIsEditModalOpen(true)}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        {/* THEME TOGGLE */}
        <div className="w-full flex items-center justify-between p-4 bg-transparent border-b border-border hover:bg-card-hover transition-colors">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <div>
              <span className="font-medium text-sm text-foreground block">
                App Theme
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {theme} mode
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              theme === "dark" ? "bg-primary" : "bg-muted-foreground/40"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </SettingsSection>

      {/* LOGOUT */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full bg-border/30 hover:bg-destructive/10 border border-border hover:border-destructive/50 text-destructive rounded-xl p-4 flex items-center justify-center gap-2 font-bold transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* 🔥 EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-background rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-foreground mb-6">
              Edit Profile
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Batting Style
                </label>
                <CustomDropdown
                  placeholder="Select Batting Style"
                  value={formData.batting_style}
                  options={battingOptions}
                  onChange={(val) =>
                    setFormData({ ...formData, batting_style: val })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Bowling Style
                </label>
                <CustomDropdown
                  placeholder="Select Bowling Style"
                  value={formData.bowling_style}
                  options={bowlingOptions}
                  onChange={(val) =>
                    setFormData({ ...formData, bowling_style: val })
                  }
                  direction="up"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl mt-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default SettingsPage;
