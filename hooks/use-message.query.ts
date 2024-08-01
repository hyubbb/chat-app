import { useQuery } from "@tanstack/react-query";
import { messagesType, UserType } from "@/types";
import axios from "axios";

type useMessageQueryType = {
  chatId: number;
  user: UserType;
  receiverId?: number | null;
  direct?: boolean;
};

export const useMessageQuery = ({
  chatId,
  user,
  receiverId = null,
  direct = false,
}: useMessageQueryType) => {
  const isUser = user.id;

  const getMessages = async () => {
    if (!isUser) return;
    const { data } = await axios.post(`/api/socket/chat/${chatId}`, {
      userId: user?.user_id,
      userName: user?.user_name,
      direct,
    });
    return data.data.messages;
  };

  const { data, isError, isLoading } = useQuery<messagesType[]>({
    queryKey: ["messages", chatId],
    // queryFn: !receiverId ? getMessages : getDirectMessages,
    queryFn: getMessages,
    initialData: [],
    enabled: !!isUser,
  });

  return { data, isError, isLoading };
};
