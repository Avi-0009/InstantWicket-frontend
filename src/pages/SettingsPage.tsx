import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { getInitials } from "../utils/helpers";
import { Logout } from "../Api/Auth";
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
    {/* If a custom right element (like a toggle) is passed, render it. Otherwise show chevron */}
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

  const handleLogout = async () => {
    try {
      await Logout();
      toast.success("User logged out successfully!");
    } catch (err) {
      console.error("Logout failed on server", err);
      toast.success("Failed to logout user!");
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
          onClick={() => navigate("/")}
          className="p-2 bg-card border border-border rounded-full hover:bg-card-hover hover:border-primary/50 transition-all shadow-sm text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold text-foreground">Settings</h1>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-colors cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold border border-primary/30">
          {getInitials(user.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      <SettingsSection title="Account">
        <SettingsMenuItem
          icon={User}
          label="Personal Information"
          onClick={() => {}}
        />
        <SettingsMenuItem
          icon={Shield}
          label="Privacy & Security"
          onClick={() => {}}
          hideBorder={true}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        {/* THEME TOGGLE MENU ITEM */}
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

          {/* Animated Toggle Switch */}
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

        <SettingsMenuItem
          icon={Bell}
          label="Push Notifications"
          onClick={() => {}}
          hideBorder={true}
        />
      </SettingsSection>

      <SettingsSection title="Support">
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
      </SettingsSection>

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
