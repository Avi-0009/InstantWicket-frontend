import { useMutation } from "@tanstack/react-query";
import { createMatchApi } from "../Api/Match";
import toast from "react-hot-toast"; // Import toast

export const useCreateMatch = () => {
  return useMutation({
    mutationFn: createMatchApi,
    onSuccess: (data) => {
      console.log("Match created successfully!", data);
      toast.success("Match created successfully!"); // Add success toast
    },
    onError: (error: any) => {
      console.error("Error creating match:", error);
      // Extract error message from backend if available
      const message = error.response?.data?.error || "Failed to create match";
      toast.error(message); // Add error toast
    },
  });
};
