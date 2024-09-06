// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅
"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type categoriesPropsType = {
  chatId: number;
  messages: messagesType[];
  messages_type?: string;
  startTime: number;
  nextCursor: number;
};

type MessageQueryProps = {
  pages: { messages: messagesType[]; nextCursor: number }[];
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
      nextCursor,
    }: categoriesPropsType) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Socket.IO 처리 시간: ${duration.toFixed(2)}ms`);

      const nextCursorKey =
        messages?.length >= 20
          ? messages[messages.length - 1]?.message_id
          : undefined;

      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!messages) return oldData;
        if (
          !oldData ||
          !oldData.pages ||
          !oldData.pages.length ||
          !messages_type
        ) {
          return {
            pages: [
              {
                messages: messages,
                nextCursor: nextCursorKey,
              },
            ],
            pageParams: [undefined],
          };
        }

        const oldMessages = oldData.pages[0].messages;
        const oldCursorKey =
          oldMessages.length >= 20
            ? oldMessages[oldMessages.length - 1].message_id
            : undefined;

        const newMessages = Array.isArray(messages) ? messages : [messages];
        const updatedFirstPage = {
          messages: [...newMessages, ...oldData.pages[0].messages],
          nextCursor: oldCursorKey || oldData.pages[0].nextCursor,
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
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

    return () => {
      socket.off("messages", handleMessageUpdate);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [socket, isConnected, handleMessageUpdate]);
};
