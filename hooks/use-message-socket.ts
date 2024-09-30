"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type MessageUpdateProps = {
  chatId: number;
  messages: messagesType | messagesType[];
  messages_type?: string;
  startTime: number;
  nextCursor?: number;
};

export const useMessageSocket = ({ chatId }: { chatId: number }) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const handleMessageUpdate = useCallback(
    ({ chatId, messages, messages_type, startTime }: MessageUpdateProps) => {
      if (chatId !== chatIdRef.current) return;

      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Socket.IO 처리 시간: ${duration.toFixed(2)}ms`);

      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!messages) return oldData;

        const newMessages = Array.isArray(messages) ? messages : [messages];
        const nextCursorKey =
          newMessages.length >= 20
            ? newMessages[newMessages.length - 1]?.message_id
            : undefined;

        if (
          !oldData ||
          !oldData.pages ||
          !oldData.pages.length ||
          !messages_type
        ) {
          return {
            pages: [{ messages: newMessages, nextCursor: nextCursorKey }],
            pageParams: [undefined],
          };
        }

        const updatedFirstPage = {
          messages: [...newMessages, ...oldData.pages[0].messages],
          nextCursor: oldData.pages[0].nextCursor || nextCursorKey,
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };
      });
    },
    [queryClient],
  );

  const handleDeleteMessage = useCallback(
    ({ chatId, messages }: MessageUpdateProps) => {
      if (chatId !== chatIdRef.current) return;

      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!oldData) return oldData;

        const newMessage = Array.isArray(messages) ? messages[0] : messages;
        const updatedPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((oldMessage: messagesType) =>
            oldMessage.message_id === newMessage.message_id
              ? newMessage
              : oldMessage,
          ),
        }));

        return { ...oldData, pages: updatedPages };
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("messages", handleMessageUpdate);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("messages", handleMessageUpdate);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [socket, isConnected, handleMessageUpdate, handleDeleteMessage]);
};
