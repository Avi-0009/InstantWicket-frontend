// import { Users } from "lucide-react";
// import { useMatchWizardStore } from "../store/useMatchWizardStore";

// export const Step2Teams = () => {
//   const { teamA, teamB, setField } = useMatchWizardStore();

//   return (
//     <div className="animate-fade-in space-y-6">
//       <h2 className="text-xl font-bold text-[#F4FFFD] flex items-center gap-2 mb-4">
//         <Users className="w-5 h-5 text-[#0FAF9A]" /> Name Your Teams
//       </h2>
//       <div className="space-y-4">
//         <div>
//           <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
//             Team A Name
//           </label>
//           <input
//             type="text"
//             value={teamA}
//             onChange={(e) => setField("teamA", e.target.value)}
//             placeholder="e.g. Warriors"
//             className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A]"
//           />
//         </div>
//         <div className="flex justify-center py-2 text-[#9FB7B2] font-black italic">
//           VS
//         </div>
//         <div>
//           <label className="text-xs font-bold text-[#9FB7B2] uppercase mb-2 block">
//             Team B Name
//           </label>
//           <input
//             type="text"
//             value={teamB}
//             onChange={(e) => setField("teamB", e.target.value)}
//             placeholder="e.g. Titans"
//             className="w-full bg-[#0B1F1B] border border-[#1B3530] text-[#F4FFFD] rounded-xl py-3 px-4 focus:outline-none focus:border-[#0FAF9A]"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
