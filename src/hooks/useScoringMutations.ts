// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { recordBallApi, RecordBallPayload } from "../Api/Scoring";

// export const useRecordBall = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: RecordBallPayload) => recordBallApi(payload),
//     onSuccess: (_, variables) => {
//       // Invalidate the live scoreboard query so it automatically updates
//       queryClient.invalidateQueries({
//         queryKey: ["liveScoreboard", variables.match_id],
//       });
//       console.log("Ball recorded successfully");
//     },
//     onError: (error) => {
//       console.error("Failed to record ball:", error);
//     },
//   });
// };
