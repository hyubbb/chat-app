// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";
import { useEffect } from "react";
import { useSocketStore } from "./use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type categoriesPropsType = {
  chatId: string;
  messages: messagesType[];
};

export const useMessageSocket = () => {
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();

  const handleCategoryUpdate = ({ chatId, messages }: categoriesPropsType) => {
    queryClient.setQueryData(["messages", chatId], messages);
  };
 

  useEffect(() => {
    if (!socket) return;
    socket.on("messages", handleCategoryUpdate);
    // 실시간 접속 메시지 수신

    return () => {
      socket.off("messages", handleCategoryUpdate);
    };
  }, [socket]);
};
