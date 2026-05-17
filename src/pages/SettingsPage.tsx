import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
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
} from "lucide-react";

const SettingsSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-[#9FB7B2] uppercase tracking-wider mb-2 px-2">
      {title}
    </h3>
    <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl overflow-hidden shadow-lg">
      {children}
    </div>
  </div>
);

const SettingsMenuItem = ({
  icon: Icon,
  label,
  onClick,
  hideBorder = false,
}: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 bg-transparent hover:bg-[#122A25] transition-colors ${
      !hideBorder ? "border-b border-[#1B3530]" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-[#0FAF9A]" />
      <span className="font-medium text-sm text-[#F4FFFD]">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-[#9FB7B2]" />
  </button>
);

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (err) {
      console.error("Logout failed on server", err);
    } finally {
      logout();
      navigate("/auth");
    }
  };

  if (!user) return null;

  return (
    <main className="p-4 md:p-6 max-w-2xl mx-auto w-full animate-fade-in pb-24 bg-[#061311]">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/")}
          className="p-2 bg-[#0B1F1B] border border-[#1B3530] rounded-full hover:bg-[#122A25] hover:border-[#0FAF9A]/50 transition-all shadow-lg text-[#F4FFFD]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[28px] font-bold text-[#F4FFFD]">Settings</h1>
      </div>

      <div className="bg-[#0B1F1B] border border-[#1B3530] rounded-xl p-5 mb-8 flex items-center gap-4 shadow-lg hover:border-[#0FAF9A]/30 transition-colors cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-[#0FAF9A]/20 text-[#0FAF9A] flex items-center justify-center text-2xl font-bold border border-[#0FAF9A]/30">
          {getInitials(user.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#F4FFFD]">{user.name}</h2>
          <p className="text-sm text-[#9FB7B2]">{user.phone}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#9FB7B2]" />
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
          className="w-full bg-[#1B3530]/30 hover:bg-[#FF6B6B]/10 border border-[#1B3530] hover:border-[#FF6B6B]/50 text-[#FF6B6B] rounded-xl p-4 flex items-center justify-center gap-2 font-bold transition-all shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </main>
  );
};

export default SettingsPage;
