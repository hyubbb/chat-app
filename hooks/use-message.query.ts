import qs from "query-string";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSocketStore } from "./use-store";
import { useRoomStore } from "./use-room.store";
import { messagesType } from "@/types";

export const useMessageQuery = (chatId: string) => {
  const { data, isError, isLoading } = useQuery<messagesType[]>({
    queryKey: ["messages", chatId],
  });

  return { data, isError, isLoading };
};
