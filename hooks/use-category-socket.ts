// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";

import { useCallback, useEffect } from "react";
import { useStore } from "../store/use-store";
import { useQueryClient } from "@tanstack/react-query";

// 타입 정의
interface CategoryRoom {
  // 필요한 속성 정의
  room_id: number;
  name: string;
}

interface Category {
  category_id: number;
  name: string;
  rooms: CategoryRoom[];
}

/**
 * 카테고리 및 방 목록 실시간 업데이트를 위한 소켓 훅
 * 방 생성, 삭제, 카테고리 변경 등의 이벤트를 처리합니다.
 */
export const useCategorySocket = () => {
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  // 카테고리 리스트 업데이트 핸들러
  const handleCategoryList = useCallback(
    (data: Category[]) => {
      try {
        // 전체 카테고리 리스트 업데이트
        queryClient.setQueryData(["categoryList"], data);

        // 각 카테고리의 rooms 데이터 개별 업데이트
        data.forEach((category) => {
          queryClient.setQueryData(
            ["categoryRooms", category.category_id],
            category.rooms,
          );
        });
      } catch (error) {
        console.error("카테고리 데이터 업데이트 중 오류 발생:", error);
      }
    },
    [queryClient],
  );

  // 소켓 이벤트 구독 및 정리
  useEffect(() => {
    if (!socket || !isConnected) return;

    // 카테고리 리스트 이벤트 구독
    socket.on("categoryList", handleCategoryList);

    return () => {
      // 이벤트 구독 해제
      socket.off("categoryList", handleCategoryList);
    };
  }, [socket, isConnected, handleCategoryList]);
};
