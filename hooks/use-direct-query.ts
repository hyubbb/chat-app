"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dmListType, messagesType, UserType } from "@/types";
import axios from "axios";
import { createDMRoomId } from "@/util/utils";
import { useEffect, useState } from "react";

interface UseDirectQueryProps {
  user: UserType | null;
  chatId?: number | null;
  initDmList?: dmListType[] | null;
}

/**
 * DM 메시지와 DM 목록을 조회하는 커스텀 훅
 */
export const useDirectQuery = ({
  user,
  chatId = null,
  initDmList,
}: UseDirectQueryProps) => {
  const [dmRoomId, setDmRoomId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // chatId와 user 정보로 DM 방 ID 생성
  useEffect(() => {
    if (chatId && user?.user_id) {
      const newDmRoomId: string = createDMRoomId(chatId, user.user_id);
      setDmRoomId(newDmRoomId);
    }
  }, [chatId, user]);

  /**
   * 특정 DM 방의 메시지 목록을 조회
   * @returns 메시지 배열 또는 빈 배열
   */
  const getMessages = async (): Promise<messagesType[]> => {
    if (!dmRoomId || !chatId || !user?.user_id) return [];

    try {
      const { data } = await axios.post(`/api/socket/direct/${chatId}`, {
        userId: user.user_id,
        userName: user.user_name,
        direct: true,
      });

      return data?.data?.messages || [];
    } catch (error) {
      console.error("DM 메시지 조회 실패:", error);
      return [];
    }
  };

  /**
   * 사용자의 DM 목록 조회
   * @returns DM 방 목록 또는 빈 배열
   */
  const getDmList = async (): Promise<dmListType[]> => {
    if (!user?.user_id) return [];

    try {
      const { data } = await axios.get(`/api/socket/direct/${user.user_id}`);
      return data.result || [];
    } catch (error) {
      console.error("DM 목록 조회 실패:", error);
      return [];
    }
  };

  // DM 메시지 조회 쿼리
  const {
    data: messages,
    isError: messagesError,
    isLoading: messagesIsLoading,
  } = useQuery<messagesType[]>({
    queryKey: ["directMessages", dmRoomId],
    queryFn: getMessages,
    initialData: [],
    enabled: !!(dmRoomId && chatId && user?.user_id),
  });

  // DM 목록 조회 쿼리
  const {
    data: dmList,
    isError: dmListError,
    isLoading: dmListLoading,
    refetch: refetchDmList,
  } = useQuery<dmListType[]>({
    queryKey: ["dmList", user?.user_id],
    queryFn: getDmList,
    initialData: initDmList || [],
    enabled: !!user?.user_id,
  });

  // 새로운 DM 방에 접속했을 때 dmList 즉시 invalidate
  useEffect(() => {
    if (chatId && user?.user_id && dmList) {
      const currentDm = dmList.find((dm) => dm.other_id === chatId);

      // 현재 채팅 상대가 dmList에 없으면 즉시 invalidate
      if (!currentDm) {
        queryClient.invalidateQueries({
          queryKey: ["dmList", user.user_id],
        });
      }
    }
  }, [chatId, user?.user_id, dmList, queryClient]);

  return {
    messages,
    messagesError,
    messagesIsLoading,
    dmList,
    dmListError,
    dmListLoading,
    refetchDmList,
  };
};
