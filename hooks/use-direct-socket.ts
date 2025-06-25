"use client";

import { useEffect } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import { createDMRoomId } from "@/util/utils";

type DirectSocketPropsType = {
  messages: messagesType[];
  messages_type?: string;
  roomId: string;
  startTime: number;
  messageId?: string;
};

export const useDirectSocket = ({
  toId,
  user,
}: {
  user: UserType | null;
  toId?: number;
}) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleMessageUpdate = ({
    messages,
    messages_type,
    roomId,
    startTime,
    messageId,
  }: DirectSocketPropsType) => {
    const endTime = performance.now(); // 응답 수신 시점 기록
    const duration = endTime - startTime;
    // console.log(`Api-Socket.io 처리 시간: ${duration.toFixed(2)}ms`);

    queryClient.setQueryData(
      ["directMessages", roomId],
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

  const handleDmListUpdate = (data: any) => {
    queryClient.setQueryData(["dmList"], data);
  };

  const handleLeaveDM = (roomId: string) => {
    queryClient.removeQueries({ queryKey: ["directMessages", roomId] });
  };

  // DM 채팅방 입장 -> toId(상대방의ID)가 있을경우
  useEffect(() => {
    if (!socket || !isConnected || !toId || !user?.user_id) return;

    socket.emit("directMessage", {
      roomId: createDMRoomId(toId, user.user_id),
      chatId: toId,
      userId: user.user_id,
    });
  }, [socket, isConnected, toId, user?.user_id]);

  // DM 관련 소켓 이벤트설정
  useEffect(() => {
    if (!socket || !isConnected || !toId || !user?.user_id) return;
    const newDmRoomId: string = createDMRoomId(toId, user.user_id);
    socket.emit("createDMRoom", { chatId: newDmRoomId, userId: user.user_id });

    socket.on("directMessages", handleMessageUpdate);
    socket.on("joinDmList", handleDmListUpdate);
    socket.on("leaveDm", handleLeaveDM);

    return () => {
      socket.off("directMessages", handleMessageUpdate);
      socket.off("joinDmList", handleDmListUpdate);
      socket.off("leaveDm", handleLeaveDM);
    };
  }, [socket, isConnected, handleMessageUpdate, handleDmListUpdate, toId]);
};
