import { useQuery } from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";

type useMessageQueryType = {
  chatId: number;
};

export const useMessageQuery = ({ chatId }: useMessageQueryType) => {
  const { data, isError, isLoading } = useQuery<messagesType[]>({
    queryKey: ["messages", chatId],
    initialData: [],
  });

  return { data, isError, isLoading };
};
