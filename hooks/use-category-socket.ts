// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";
import { useEffect } from "react";
import { useStore } from "./use-store";
import { useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/types";

export const useCategorySocket = () => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleCategoryList = (data: any) => {
    // 카테고리 리스트 업데이트
    queryClient.setQueryData(["categoryList"], data);
    // 각 카테고리의 rooms 데이터 업데이트
    data.forEach((category: any) => {
      queryClient.setQueryData(
        ["categoryRooms", category.category_id],
        category.rooms,
      );
    });
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("categoryList", handleCategoryList);

    return () => {
      socket.off("categoryList", handleCategoryList);
    };
  }, [socket, isConnected]);
};
