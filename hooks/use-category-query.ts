import qs from "query-string";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSocketStore } from "./use-store";
import { useRoomStore } from "./use-room.store";

interface ChatQueryProps {
  queryKey: string;
  // apiUrl: string;
  // paramKey: "channelId" | "conversationId";
  // paramValue: string;
}

export const useCategoryQuery = ({ queryKey }: ChatQueryProps) => {
  const { isConnected } = useSocketStore();
  // const fetchMessages = async ({ pageParam = undefined }) => {
  //   const url = qs.stringifyUrl(
  //     {
  //       url: apiUrl,
  //       query: {
  //         cursor: pageParam,
  //         [paramKey]: paramValue,
  //       },
  //     },
  //     { skipNull: true },
  //   );
  //   const res = await fetch(url);
  //   return res.json();
  // };

  const categoryApi = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/socket/category");
      const data = await response.json();
      // setSelected=data[0];
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: categoryApi,
  });

  return { data, isError, isLoading };
};
