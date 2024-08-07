"use client";
import { defaultUser, UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";
import axios from "axios";

export const useUserQuery = () => {
  const token = useAuthStore((state) => state.token);
  const loginAuth = async () => {
    const { data } = await axios.get("/api/user", {
      headers: {
        withCredentials: true,
      },
    });
    return data.user;
  };

  const { data, isError, isLoading, refetch } = useQuery<UserType | null>({
    queryKey: ["user"],
    initialData: defaultUser,
    queryFn: loginAuth,
    enabled: !!token,
  });

  return { data, isError, isLoading, refetch };
};
