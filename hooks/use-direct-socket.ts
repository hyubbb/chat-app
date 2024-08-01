"use client";

import { useEffect } from "react";
import { useStore } from "./use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import { createDMRoomId } from "@/util/utils";

type DirectSocketPropsType = {
  chatId: number;
  messages: messagesType[];
  messages_type?: string;
};

export const useDirectSocket = ({
  toId,
  user,
}: {
  user: UserType | null;
  toId: number;
}) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleMessageUpdate = ({
    chatId,
    messages,
    messages_type,
  }: DirectSocketPropsType) => {
    queryClient.setQueryData(["directMessages"], (oldData: messagesType[]) => {
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
    });
  };

  const handleDmListUpdate = (data: any) => {
    queryClient.setQueryData(["dmList"], data);
  };

  useEffect(() => {
    if (!socket || !isConnected || !toId || !user?.user_id) return;
    socket.emit("directMessage", {
      dmName: createDMRoomId(toId, user?.user_id),
      chatId: toId,
      userId: user?.user_id,
    });
    socket.on("getDirectMessages", handleMessageUpdate);
    socket.on("joinDmList", handleDmListUpdate);

    return () => {
      socket.off("getDirectMessages", handleMessageUpdate);
      socket.off("joinDmList", handleDmListUpdate);
    };
  }, [socket, isConnected, toId, user?.user_id]);
};
