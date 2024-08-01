"use client";
import { defaultUser, UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useUserQuery = () => {
  const { data, isError, isLoading } = useQuery<UserType | null>({
    queryKey: ["user"],
    initialData: defaultUser,
  });

  return { data, isError, isLoading };
};
