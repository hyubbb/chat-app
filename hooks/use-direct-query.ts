import { useQuery } from "@tanstack/react-query";
import { dmListType, messagesType, UserType } from "@/types";
import axios from "axios";
import { createDMRoomId } from "@/util/utils";
import { useEffect, useState } from "react";

type useDirectQueryType = {
  user: UserType | null;
  chatId?: number | null;
  initDmList?: dmListType[] | null;
};

export const useDirectQuery = ({
  user,
  chatId = null,
  initDmList,
}: useDirectQueryType) => {
  const [dmRoomId, setDmRoomId] = useState<string | null>(null);
  useEffect(() => {
    if (chatId && user?.user_id) {
      const newDmRoomId: string = createDMRoomId(chatId, user?.user_id);
      setDmRoomId(newDmRoomId);
    }
  }, [chatId, user]);

  const getMessages = async () => {
    if (!dmRoomId) return [];
    try {
      const { data } = await axios.post(`/api/socket/direct/${chatId}`, {
        userId: user?.user_id,
        userName: user?.user_name,
        direct: true,
      });

      return data?.data?.messages;
    } catch (error) {
      console.error(error);
    }
  };

  const getDmList = async () => {
    // DM방이 눌릴때마다 실행이되네?
    if (user?.user_id == null) return [];
    try {
      const { data } = await axios.get(`/api/socket/direct/${user?.user_id}`);
      return data.result;
    } catch (error) {
      console.error(error);
    }
  };

  const {
    data: messages,
    isError: messagesError,
    isLoading: messagesIsLoading,
  } = useQuery<messagesType[]>({
    queryKey: ["directMessages", dmRoomId],
    queryFn: getMessages,
    initialData: [],
    enabled: dmRoomId !== null,
  });

  const {
    data: dmList,
    isError: dmListError,
    isLoading: dmListLoading,
  } = useQuery<dmListType[]>({
    queryKey: ["dmList"],
    queryFn: getDmList,
    initialData: initDmList || [],
    enabled: !!user?.user_id,
  });

  return {
    messages,
    messagesError,
    messagesIsLoading,
    dmList,
    dmListError,
    dmListLoading,
  };
};
