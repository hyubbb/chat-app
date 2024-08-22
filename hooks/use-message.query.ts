import {
  keepPreviousData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useCallback } from "react";
import { useStore } from "@/store/use-store";

type useMessageQueryType = {
  chatId: number;
  user: UserType | null;
  direct?: boolean;
};

export const useMessageQuery = ({
  chatId,
  user,
  direct = false,
}: useMessageQueryType) => {
  const { isConnected } = useStore();
  const isUser = user !== null;

  const getMessages = async ({
    pageParam = undefined,
  }: {
    pageParam?: number;
  }) => {
    if (!isUser) return { messages: [], nextCursor: undefined };
    try {
      const { data } = await axios.post(`/api/socket/chat/${chatId}`, {
        userId: user?.user_id,
        userName: user?.user_name,
        direct,
        cursor: pageParam,
      });
      return data.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { messages: [], nextCursor: undefined };
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["messages", chatId],
      queryFn: getMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
      initialPageParam: undefined,
      refetchOnMount: false,
    });

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};
