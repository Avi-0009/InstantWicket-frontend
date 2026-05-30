import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Logout, api } from "../Api/Auth";
import {
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Info,
  ChevronLeft,
  Moon,
  Sun,
  UserCircle,
  ShieldCheck,
  Phone,
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
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // 1. State to hold the fetched player stats
  const [playerStats, setPlayerStats] = useState<any>(null);

  // 2. Fetch stats directly when component mounts
  useEffect(() => {
    const fetchFullStats = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/player_stats/${user.id}`);
        // Handle potential nested API responses securely
        const fetchedData = res.data?.data || res.data?.stats || res.data;
        setPlayerStats(fetchedData);
      } catch (e) {
        console.error("Failed to load full stats in settings", e);
      }
    };
    fetchFullStats();
  }, [user]);

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

  if (!user) return null;

  return (
    <main className="p-4 md:p-6 max-w-2xl mx-auto w-full animate-fade-in pb-24 bg-background min-h-screen transition-colors duration-200">
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
      <div className="bg-gradient-to-br from-card to-background p-8 rounded-3xl border border-border shadow-lg text-center mb-8 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary/10 border-2 border-primary/20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
            <UserCircle className="w-16 h-16 text-primary" />
          </div>

          <h2 className="text-2xl font-black text-foreground">
            {playerStats?.name || user?.name}
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
            <div className="flex justify-center gap-4">
              <div className="flex-1 max-w-[140px]">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Batting Style
                </div>
                <div className="text-sm font-black text-foreground capitalize truncate">
                  {playerStats?.batting_style || "N/A"}
                </div>
              </div>

              <div className="w-px bg-border/60"></div>

              <div className="flex-1 max-w-[140px]">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Bowling Style
                </div>
                <div className="text-sm font-black text-foreground capitalize truncate">
                  {playerStats?.bowling_style || "N/A"}
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
          onClick={() => {}}
        />
        {/* <SettingsMenuItem
          icon={Shield}
          label="Privacy & Security"
          onClick={() => {}}
          hideBorder={true}
        /> */}
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

        {/* <SettingsMenuItem
          icon={Bell}
          label="Push Notifications"
          onClick={() => {}}
          hideBorder={true}
        /> */}
      </SettingsSection>

      {/* <SettingsSection title="Support">
        <SettingsMenuItem
          icon={HelpCircle}
          label="Help Center"
          onClick={() => {}}
        />
        <SettingsMenuItem
          icon={Info}
          label="About InstantWicket"
          onClick={() => {}}
          hideBorder={true}
        />
      </SettingsSection> */}

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
    </main>
  );
};

export default SettingsPage;
