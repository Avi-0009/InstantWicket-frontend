import React from "react";
import { AlertOctagon } from "lucide-react";

interface DeclareModalProps {
  isOpen: boolean;
  score: number;
  wickets: number;
  overs: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeclareModal: React.FC<DeclareModalProps> = ({
  isOpen,
  score,
  wickets,
  overs,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B1F1B] border border-red-900/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl zoom-in-95">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
            <AlertOctagon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Declare Innings?
          </h2>
          <p className="text-[#9FB7B2] text-sm mb-6">
            Are you sure you want to manually complete this innings? This action
            cannot be undone.
          </p>

          <div className="bg-[#0D2420] border border-[#1B3530] rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-[#9FB7B2] text-xs font-semibold uppercase">
                Final Score
              </span>
              <span className="text-white font-bold">
                {score} / {wickets}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9FB7B2] text-xs font-semibold uppercase">
                Overs Played
              </span>
              <span className="text-white font-bold">{overs}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-transparent text-[#9FB7B2] border border-[#1B3530] hover:bg-[#1B3530] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              End Innings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
