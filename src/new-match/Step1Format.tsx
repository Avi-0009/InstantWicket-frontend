// import { Trophy } from "lucide-react";
// import { useMatchWizardStore } from "../store/useMatchWizardStore";

// export const Step1Format = () => {
//   const { matchType, customOvers, setField } = useMatchWizardStore();

//   return (
//     <div className="animate-fade-in space-y-6">
//       <h2 className="text-xl font-bold text-[#F4FFFD] flex items-center gap-2 mb-4">
//         <Trophy className="w-5 h-5 text-[#0FAF9A]" /> Select Match Format
//       </h2>
//       <div className="grid grid-cols-2 gap-4">
//         {["T20", "ODI", "T10", "Custom"].map((type) => (
//           <button
//             key={type}
//             onClick={() => setField("matchType", type)}
//             className={`p-4 rounded-xl border-2 font-bold transition-all ${
//               matchType === type
//                 ? "bg-[#0FAF9A]/20 border-[#0FAF9A] text-[#0FAF9A]"
//                 : "bg-[#0B1F1B] border-[#1B3530] text-[#9FB7B2] hover:border-[#0FAF9A]/50"
//             }`}
//           >
//             {type}
//           </button>
//         ))}
//       </div>
//       {matchType === "Custom" && (
//         <div className="mt-4">
//           <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
//             Number of Overs
//           </label>
//           <input
//             type="number"
//             value={customOvers}
//             onChange={(e) => setField("customOvers", e.target.value)}
//             placeholder="e.g. 15"
//             className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A] transition-colors"
//           />
//         </div>
//       )}
//     </div>
//   );
// };
