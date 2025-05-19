"use client";

import { useQuery } from "@tanstack/react-query";
import { CategoriesType, RoomsType } from "@/types";
import { useCallback } from "react";

// 타입 정의
interface JoinRoomResponse {
  result: {
    // 참여중인 채팅방 데이터 구조 정의
    roomId: number;
    name: string;
  }[];
}

interface RoomsResponse {
  result: RoomsType[];
}

interface UseRoomQueryProps {
  categories?: CategoriesType | null;
  userId?: number | null;
}

/**
 * 사용자가 참여한 채팅방과 전체 채팅방 목록을 조회하는 훅
 */
export const useRoomQuery = ({ categories, userId }: UseRoomQueryProps) => {
  // 참여 중인 채팅방 조회
  const getJoinRoom = useCallback(async (): Promise<
    JoinRoomResponse | undefined
  > => {
    if (!userId) return undefined;

    try {
      const response = await fetch(`/api/socket/user/${userId}`);

      if (!response.ok) {
        throw new Error(`참여 채팅방 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("참여 채팅방 조회 중 오류 발생:", error);
      return undefined;
    }
  }, [userId]);

  // 전체 채팅방 목록 조회
  const getRooms = useCallback(async (): Promise<RoomsResponse | undefined> => {
    try {
      const response = await fetch(`/api/room`);

      if (!response.ok) {
        throw new Error(`채팅방 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("채팅방 목록 조회 중 오류 발생:", error);
      return undefined;
    }
  }, []);

  // 참여 중인 채팅방 쿼리
  const {
    data: joinRoomData,
    isError: isJoinRoomError,
    isLoading: isJoinRoomLoading,
  } = useQuery({
    queryKey: ["joinRoomList"],
    queryFn: getJoinRoom,
    enabled: !!userId,
  });

  // 전체 채팅방 목록 쿼리
  const {
    data: roomsData,
    isError: isRoomsError,
    isLoading: isRoomsLoading,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  return {
    joinRoomData,
    isJoinRoomError,
    isJoinRoomLoading,
    roomsData,
    isRoomsError,
    isRoomsLoading,
  };
};
