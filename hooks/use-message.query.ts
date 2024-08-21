import {
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

type GetMessagesResult = {
  messages: messagesType[];
  nextPage: number | undefined;
};

export const useMessageQuery = ({
  chatId,
  user,
  direct = false,
}: useMessageQueryType): UseInfiniteQueryResult => {
  const { isConnected } = useStore();
  const isUser = user !== null;

  const getMessages = useCallback(
    async ({
      pageParam = undefined,
    }: {
      pageParam?: number;
    }): Promise<GetMessagesResult> => {
      if (!isUser) return { messages: [], nextPage: undefined };
      try {
        const { data } = await axios.post(`/api/socket/chat/${chatId}`, {
          userId: user?.user_id,
          userName: user?.user_name,
          direct,
          cursor: pageParam,
        });
        const messages = data.success ? data.data.messages : [];
        const nextPage =
          messages.length === 20 ? data.data.nextCursor : undefined;

        return { messages, nextPage };
      } catch (error) {
        console.error("Error fetching messages:", error);
        return { messages: [], nextPage: undefined };
      }
    },
    [chatId, user, direct],
  );

  return useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: getMessages,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage;
    },
    enabled: !!isUser,
    refetchInterval: isConnected ? false : 1000,
    initialPageParam: undefined,
  });
};
