"use client";

import { useCallback, useEffect } from "react";
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
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  // 채팅방 참여자 목록 업데이트 핸들러
  const handleJoinRoom = useCallback(
    (data: JoinRoomData[]) => {
      try {
        // 캐시 업데이트
        queryClient.setQueryData(["joinRoomList"], data);

        // 서버와 데이터 동기화를 위한 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: ["joinRoomList"],
          exact: true,
        });
      } catch (error) {
        console.error("채팅방 참여자 목록 업데이트 중 오류 발생:", error);
      }
    },
    [queryClient],
  );

  // 채팅방 퇴장 핸들러
  const handleLeaveRoom = useCallback(
    ({ chatId, userId }: { chatId: number; userId: number }) => {
      try {
        // 채팅방 퇴장 시 해당 채팅방의 메시지 쿼리 제거
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
    if (!socket || !user || !chatId || !isConnected) return;

    try {
      // 채팅방 생성/입장 이벤트 발생
      socket.emit("createChatRoom", { chatId });

      // 소켓 이벤트 구독
      socket.on("joinRoomList", handleJoinRoom);
      socket.on("leaveRoom", handleLeaveRoom);

      return () => {
        // 이벤트 구독 해제
        socket.off("joinRoomList", handleJoinRoom);
        socket.off("leaveRoom", handleLeaveRoom);
      };
    } catch (error) {
      console.error("채팅방 소켓 연결 중 오류 발생:", error);
    }
  }, [socket, user, chatId, isConnected, handleJoinRoom, handleLeaveRoom]);
};
