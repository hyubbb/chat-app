"use client";
import React, { useEffect, useRef, useState } from "react";
import { redirect } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useStore } from "@/store/use-store";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/store/use-user-query";

import { useDirectSocket } from "@/hooks/use-direct-socket";
import { useDirectQuery } from "@/hooks/use-direct-query";
import { Loading } from "../../../../../components/loading";
import Video from "../../../../../components/video";
import { ChatHeader } from "./chat/header";
import { ChatMessage } from "./chat/message";
import { ChatInput } from "./chat/input";

export const DirectRoom = ({ chatId }: { chatId: number }) => {
  const { setIsLoginModalOpen } = useStore();
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading: userIsLoading,
    isError: userError,
  } = useUserQuery();
  useRoomSocket({ chatId, user: user });
  useDirectSocket({ toId: chatId, user });
  const { messages, dmList, messagesIsLoading, refetchDmList } = useDirectQuery(
    {
      chatId,
      user,
    },
  );

  const dmInfo = dmList?.find((dm) => dm.other_id === chatId) || null;

  useEffect(() => {
    if (chatId === user?.user_id) return redirect("/");
  }, [chatId, user]);

  useEffect(() => {
    if (userIsLoading) {
      return; // 로딩 중일 때는 아무것도 하지 않음
    }

    if (!user && !userError) {
      setIsLoginModalOpen(true); // 로딩이 완료되고 유저가 없을 때 모달을 열기
    }
  }, [user, userIsLoading, userError, setIsLoginModalOpen]);

  // 새로운 DM 방에 접속했을 때 dmList 즉시 invalidate
  useEffect(() => {
    if (user?.user_id && chatId && !dmInfo && dmList && dmList.length > 0) {
      // DM 정보가 없고 dmList가 로드된 상태라면 즉시 invalidate
      queryClient.invalidateQueries({
        queryKey: ["dmList", user.user_id],
      });
    }
  }, [user?.user_id, chatId, dmInfo, dmList, queryClient]);

  // 사용자 정보 로딩 중이거나 사용자가 없으면서 에러가 아닌 경우
  if (userIsLoading) return <Loading />;

  // 사용자가 없고 에러가 있는 경우 로그인 모달 표시
  if (!user && userError) {
    setIsLoginModalOpen(true);
    return <Loading />;
  }

  // 메시지 로딩 중인 경우만 로딩 표시
  if (messagesIsLoading && user) return <Loading />;

  return (
    <>
      <ChatHeader user={user} chatId={chatId} dmInfo={dmInfo} />
      {/* 영상통화 UI */}

      <ChatMessage
        messages={messages}
        user={user}
        chatId={chatId}
        isLoading={messagesIsLoading}
      />
      <ChatInput user={user} chatId={chatId} dmInfo={dmInfo} />
    </>
  );
};
