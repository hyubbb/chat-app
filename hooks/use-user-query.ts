"use client";
import { useQuery } from "@tanstack/react-query";

export const useUserQuery = () => {
  const userApi = async () => {
    try {
      // user의 정보를 가져오는 코드가 필요함 지금은 임시로 처리하겠다.
      const user = { userId: 1, userName: "admin", role: "admin" };
      return user;
      // const response = await fetch("http://localhost:3000/api/socket/user");
      // const data = await response.json();
      // return data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: userApi,
  });

  return { data, isError, isLoading };
};
