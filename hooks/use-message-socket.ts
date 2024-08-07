// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type categoriesPropsType = {
  chatId: number;
  messages: messagesType[] | messagesType;
  messages_type?: string;
  startTime: number;
};

export const useMessageSocket = ({ chatId }: { chatId: number }) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleMessageUpdate = useCallback(
    ({ chatId, messages, messages_type, startTime }: categoriesPropsType) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Socket.IO 처리 시간: ${duration.toFixed(2)}ms`);

      queryClient.setQueryData(
        ["messages", chatId],
        (oldData: messagesType[]) => {
          if (!oldData || !oldData.length || !messages_type) {
            return Array.isArray(messages) ? messages : [messages];
          }

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
    },
    [queryClient],
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("messages", handleMessageUpdate);
    socket.on("receiveMessage", handleMessageUpdate);

    return () => {
      socket.off("messages", handleMessageUpdate);
      socket.off("receiveMessage", handleMessageUpdate);
    };
  }, [socket, isConnected, handleMessageUpdate]);
};
