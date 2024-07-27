// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";
import { useEffect } from "react";
import { useSocketStore } from "./use-store";
import { useQueryClient } from "@tanstack/react-query";

export const useRoomSocket = () => {
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  const handleCategoryUpdate = (data: any) => {
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

  const handleJoinRoom = (data: any) => {
    // 채팅방 입장 시
    queryClient.setQueryData(["joinRoomList"], data);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("categoryList", handleCategoryUpdate);
    socket.on("joinRoomList", handleJoinRoom);

    return () => {
      socket.off("categoryList", handleCategoryUpdate);
    };
  }, [socket]);
};
