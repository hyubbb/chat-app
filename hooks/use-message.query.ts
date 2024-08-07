import { useQuery } from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import axios from "axios";

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
  const isUser = user?.id !== null;

  const getMessages = async () => {
    if (!isUser) return [];
    const { data } = await axios.post(`/api/socket/chat/${chatId}`, {
      userId: user?.user_id,
      userName: user?.user_name,
      direct,
    });

    return data.data.messages;
  };

  const { data, isError, isLoading } = useQuery<messagesType[]>({
    queryKey: ["messages", chatId],
    queryFn: getMessages,
    initialData: [],
    refetchOnWindowFocus: false,
    enabled: !!isUser,
  });

  return { data, isError, isLoading };
};
