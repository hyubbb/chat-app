import { useQuery } from "@tanstack/react-query";
import { dmListType, messagesType, UserType } from "@/types";
import axios from "axios";

type useDirectQueryType = {
  chatId?: number;
  user: UserType;
  direct?: boolean;
};

export const useDirectQuery = ({
  chatId,
  user,
  direct = false,
}: useDirectQueryType) => {
  const isUser = user.user_id;
  const getMessages = async () => {
    if (!isUser || !chatId) return null;
    const { data } = await axios.post(`/api/socket/direct/${chatId}`, {
      userId: user?.user_id,
      userName: user?.user_name,
      direct,
    });
    return data.data.messages;
  };

  const getDmList = async () => {
    if (!isUser) return;
    const { data } = await axios.get(`/api/socket/direct/${user?.user_id}`);
    return data.result;
  };

  const {
    data: messages,
    isError: messagesError,
    isLoading: messagesLoading,
  } = useQuery<messagesType[]>({
    queryKey: ["directMessages"],
    // queryFn: !receiverId ? getMessages : getDirectMessages,
    queryFn: getMessages,
    initialData: [],
    enabled: !!isUser,
  });

  const {
    data: dmList,
    isError: dmListError,
    isLoading: dmListLoading,
  } = useQuery<dmListType[]>({
    queryKey: ["dmList"],
    // queryFn: !receiverId ? getMessages : getDirectMessages,
    queryFn: getDmList,
    initialData: [],
    enabled: !!isUser,
  });

  return {
    messages,
    messagesError,
    messagesLoading,
    dmList,
    dmListError,
    dmListLoading,
  };
};
