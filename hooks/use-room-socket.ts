// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";
import { useEffect } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/types";

type UseRoomSocketProps = {
  chatId: number;
  user: UserType | null;
};

export const useRoomSocket = ({ chatId, user }: UseRoomSocketProps) => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  const handleJoinRoom = (data: any) => {
    // 접속중인 채팅방
    queryClient.setQueryData(["joinRoomList"], data);
  };

  const handleLeaveRoom = ({
    chatId,
    userId,
  }: {
    chatId: number;
    userId: number;
  }) => {
    // 채팅방 퇴장 시
    queryClient.removeQueries({ queryKey: ["messages", chatId] });
  };

  useEffect(() => {
    if (!socket || !user || !chatId || !isConnected) return;

    socket.emit("joinRoom", { chatId });
    socket.emit("joinRoomList", { userId: user?.user_id });

    socket.on("joinRoomList", handleJoinRoom);
    socket.on("leaveRoom", handleLeaveRoom);

    return () => {
      socket.off("joinRoomList", handleJoinRoom);
      socket.off("leaveRoom", handleLeaveRoom);
    };
  }, [socket, user, chatId, isConnected]);
};
