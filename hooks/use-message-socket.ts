// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";

import { useEffect } from "react";
import { useStore } from "./use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type categoriesPropsType = {
  chatId: number;
  messages: messagesType[];
  messages_type?: string;
};

export const useMessageSocket = ({ chatId }: { chatId: number }) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleMessageUpdate = ({
    chatId,
    messages,
    messages_type,
  }: categoriesPropsType) => {
    queryClient.setQueryData(
      ["messages", chatId],
      (oldData: messagesType[]) => {
        if (!oldData || !oldData.length || !messages_type) {
          // 초기 로딩: messages가 배열일 것으로 예상
          return Array.isArray(messages) ? messages : [messages];
        }

        // 넘어온 메세지가 배열이 아닌경우: 메세지나, 시스템메세지
        // 배열인경우 기존에 채팅방에 접속중이어서 대화가 있는 경우
        if (
          (oldData.length === 1 && !messages_type) ||
          messages_type === "deleted"
        ) {
          return messages;
        }

        return Array.isArray(messages)
          ? [...oldData, ...messages]
          : [...oldData, messages];
      },
    );
  };

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on("messages", handleMessageUpdate);

    return () => {
      socket.off("messages", handleMessageUpdate);
    };
  }, [socket, isConnected]);
};
