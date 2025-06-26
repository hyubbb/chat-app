"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType } from "@/types";

type MessageUpdateProps = {
  chatId: number;
  messages: messagesType;
  messages_type?: string;
  startTime: number;
  nextCursor?: number;
  user_id?: number;
};

type UseMessageSocketProps = {
  chatId: number;
  userId: number;
  onMessageReceive?: ({ messages_type }: { messages_type: string }) => void; // ✅ 콜백 옵션 추가
};

/**
 * 특정 채팅방의 실시간 메시지 처리를 위한 소켓 훅
 */
export const useMessageSocket = ({
  chatId,
  userId,
  onMessageReceive,
}: UseMessageSocketProps) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  const handleMessageUpdate = useCallback(
    (props: MessageUpdateProps) => {
      const {
        chatId: incomingChatId,
        messages,
        messages_type,
        startTime,
      } = props;

      if (incomingChatId !== chatIdRef.current) return;

      // 콜백 실행: 새 메시지가 이 방에 들어왔을 때만
      if (
        typeof onMessageReceive === "function" &&
        messages.user_id !== userId
      ) {
        onMessageReceive({ messages_type: messages.message_type });
      }

      if (process.env.NODE_ENV === "development") {
        const endTime = performance.now();
        const duration = endTime - startTime;
        // console.log(`Socket.IO 처리 시간: ${duration.toFixed(2)}ms`);
      }

      type QueryDataType = {
        pages: Array<{
          messages: messagesType[];
          nextCursor?: number;
        }>;
        pageParams: Array<unknown>;
      };

      queryClient.setQueryData(
        ["messages", chatId],
        (oldData: QueryDataType | undefined) => {
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
        },
      );
    },
    [queryClient],
  );

  const handleDeleteMessage = useCallback(
    ({ chatId, messages }: MessageUpdateProps) => {
      if (chatId !== chatIdRef.current) return;

      type QueryDataType = {
        pages: Array<{
          messages: messagesType[];
          nextCursor?: number;
        }>;
        pageParams: Array<unknown>;
      };

      queryClient.setQueryData(
        ["messages", chatId],
        (oldData: QueryDataType | undefined) => {
          if (!oldData?.pages) return oldData;

          const newMessage = Array.isArray(messages) ? messages[0] : messages;
          const updatedPages = oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((oldMessage: messagesType) =>
              oldMessage.message_id === newMessage.message_id
                ? newMessage
                : oldMessage,
            ),
          }));

          return { ...oldData, pages: updatedPages };
        },
      );
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
