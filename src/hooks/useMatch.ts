import { useMutation } from "@tanstack/react-query";
import { createMatchApi } from "../Api/Match";

export const useCreateMatch = () => {
  return useMutation({
    mutationFn: createMatchApi,
    onSuccess: (data) => {
      console.log("Match created successfully!", data);
    },
    onError: (error) => {
      console.error("Error creating match:", error);
    },
  });
};
