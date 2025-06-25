"use client";
import { UserType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";
import axios from "axios";

export const useUserQuery = (initUser?: UserType) => {
  const token = useAuthStore((state) => state.token);
  // token값을 확인하여 로그인 상태인지 확인
  const loginAuth = async () => {
    const { data } = await axios.get("/api/user", {
      headers: {
        withCredentials: true,
      },
    });
    return data ? data.user : null;
  };

  const { data, isError, isLoading, refetch } = useQuery<UserType | null>({
    queryKey: ["user"],
    initialData: initUser || null,
    queryFn: loginAuth,
    // enabled: !!token,
  });

  return { data, isError, isLoading, refetch };
};
