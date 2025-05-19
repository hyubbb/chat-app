"use client";

import {
  QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useCallback } from "react";
import { useStore } from "@/store/use-store";

// 확장된 타입 정의
interface MessageQueryProps {
  chatId: number;
  user: UserType | null;
  direct?: boolean;
  isLoading?: boolean;
}

interface MessagePageData {
  messages: messagesType[];
  nextCursor?: number;
}

/**
 * 특정 채팅방의 메시지를 무한 스크롤로 조회하는 훅
 */
export const useMessageQuery = ({
  chatId,
  user,
  direct = false,
  isLoading = false,
}: MessageQueryProps) => {
  const { isConnected } = useStore();
  const isUser = user !== null;
  const queryClient = useQueryClient();
  // 메시지 조회 함수를 useCallback으로 최적화
  const getMessages = useCallback(
    async ({
      pageParam = undefined,
    }: {
      pageParam?: number;
    }): Promise<MessagePageData> => {
      if (!isUser) return { messages: [], nextCursor: undefined };

      try {
        const { data } = await axios.post(`/api/socket/chat/${chatId}`, {
          userId: user?.user_id,
          userName: user?.user_name,
          direct,
          cursor: pageParam,
        });

        return data.data || { messages: [], nextCursor: undefined };
      } catch (error) {
        console.error("메시지 조회 중 오류 발생:", error);

        // 에러 상태를 전역 상태로 관리하거나 UI에 표시하는 로직 추가 가능
        return { messages: [], nextCursor: undefined };
      }
    },
    [chatId, user, direct, isUser],
  );

  // useInfiniteQuery를 사용한 무한 스크롤 구현
  const queryResult = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: getMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: isConnected ? false : 1000, // 소켓 연결이 끊겼을 때만 주기적으로 갱신
    initialPageParam: undefined,
    refetchOnMount: false,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    queryResult;

  // 사용자 정의 reset 함수 생성
  const resetMessages = useCallback(() => {
    queryClient.resetQueries({ queryKey: ["messages", chatId] });
  }, [queryClient, chatId]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    reset: resetMessages,
    // 추가적인 헬퍼 함수나 계산된 값을 여기에 제공할 수 있음
    isError: status === "error",
    isLoading: isLoading,
  };
};
