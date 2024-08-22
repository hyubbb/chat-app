// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅
"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type categoriesPropsType = {
  chatId: number;
  messages: MessageQueryProps;
  messages_type?: string;
  startTime: number;
  nextPage: number;
};

type MessageQueryProps = {
  pages: { messages: messagesType[] | []; nextCursor: number };
  pageParams: number[];
};

export const useMessageSocket = ({ chatId }: { chatId: number }) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleMessageUpdate = useCallback(
    ({
      chatId,
      messages,
      messages_type,
      startTime,
      nextPage,
    }: categoriesPropsType) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Socket.IO 처리 시간: ${duration.toFixed(2)}ms`);

      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (
          !oldData ||
          !oldData.pages ||
          !oldData.pages.length ||
          !messages_type
        ) {
          return {
            pages: [
              {
                messages: Array.isArray(messages) ? messages : [messages],
                nextPage: nextPage,
              },
            ],
            pageParams: [nextPage],
          };
        }

        const newMessages = Array.isArray(messages)
          ? [...oldData.pages[0].messages, ...messages]
          : [...oldData.pages[0].messages, messages];

        return {
          ...oldData,
          pages: [
            {
              messages: newMessages,
              ...oldData.pages.slice(1),
              nextPage: oldData.pages[0].nextPage,
            },
          ],
        };
      });
    },
    [],
  );

  const handleDeleteMessage = useCallback(
    ({ chatId, messages }: categoriesPropsType) => {
      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        const newMessage = Array.isArray(messages) ? messages[0] : messages;
        const updatesData = oldData.pages.map((page: any) => {
          return {
            ...page,
            messages: page.messages.map((oldMessage: any) =>
              oldMessage.message_id === newMessage.message_id
                ? newMessage
                : oldMessage,
            ),
          };
        });

        return {
          ...oldData,
          pages: updatesData,
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("messages", handleMessageUpdate);
    socket.on("deleteMessage", handleDeleteMessage);
    socket.on("receiveMessage", handleMessageUpdate);

    return () => {
      socket.off("messages", handleMessageUpdate);
      socket.off("deleteMessage", handleDeleteMessage);
      socket.off("receiveMessage", handleMessageUpdate);
    };
  }, [socket, isConnected, handleMessageUpdate]);
};
