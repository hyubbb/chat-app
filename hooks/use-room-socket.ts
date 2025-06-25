"use client";

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { UserType } from "@/types";

// 타입 정의
interface JoinRoomData {
  roomId: number;
  userList: UserType[];
}

interface UseRoomSocketProps {
  chatId: number;
  user: UserType | null;
}

/**
 * 채팅방 입장/퇴장 및 참여자 목록 관리를 위한 소켓 훅
 * 방 생성, 입장, 퇴장 등의 이벤트를 처리합니다.
 */
export const useRoomSocket = ({ chatId, user }: UseRoomSocketProps) => {
  const hasJoined = useRef(false);
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();
  const isInitialMount = useRef(true);

  // 채팅방 목록 업데이트 핸들러
  const handleJoinRoom = useCallback(
    (data: JoinRoomData[]) => {
      try {
        queryClient.setQueryData(["joinRoomList"], data);
      } catch (error) {
        console.error("채팅방 참여자 목록 업데이트 중 오류 발생:", error);
      }
    },
    [queryClient],
  );

  // 채팅방 퇴장 핸들러
  const handleLeaveRoom = useCallback(
    ({ chatId }: { chatId: number }) => {
      try {
        // 채팅방 퇴장 시 해당 채팅방의 메시지 쿼리 제거
        console.log("채팅방에서퇴장");
        queryClient.removeQueries({ queryKey: ["messages", chatId] });
        // 필요한 경우 참여자 목록에서 해당 유저 제거 로직 추가
      } catch (error) {
        console.error("채팅방 퇴장 처리 중 오류 발생:", error);
      }
    },
    [queryClient],
  );

  // 소켓 이벤트 구독 및 정리
  useEffect(() => {
    if (!socket || !user || !chatId || !isConnected || hasJoined.current)
      return;

    // 초기 마운트 시에만 실행
    if (isInitialMount.current) {
      isInitialMount.current = false;

      socket.emit("joinRoom", { userId: user.user_id });
      socket.emit("createChatRoom", { chatId });
      hasJoined.current = true;

      socket.on("joinRoomList", handleJoinRoom);
      socket.on("leaveRoom", handleLeaveRoom);
    }

    return () => {
      socket.off("joinRoomList", handleJoinRoom);
      socket.off("leaveRoom", handleLeaveRoom);
    };
  }, [socket, user, chatId, isConnected]);
};
