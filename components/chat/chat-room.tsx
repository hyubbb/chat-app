"use client";
import { use, useEffect, useState } from "react";
import { redirect } from "next/navigation";

import { useStore } from "@/store/use-store";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/store/use-user-query";
import { defaultCategories, defaultUser } from "@/types";

import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { useMessageQuery } from "@/hooks/use-message.query";
import { Loading } from "../loading";

export const ChatRoom = ({
  chatId,
  roomInfo,
}: {
  chatId: number;
  roomInfo: any;
}) => {
  const { setIsLoginModalOpen } = useStore();
  const { data: user, isLoading: userIsLoading } = useUserQuery();
  const { data: messages, isLoading: messagesIsLoading } = useMessageQuery({
    chatId,
    user,
  });
  useRoomSocket({ chatId, user: user });
  useMessageSocket({ chatId });

  useEffect(() => {
    if (!chatId) return redirect("/");
  }, [chatId]);

  useEffect(() => {
    if (userIsLoading) {
      return; // 로딩 중일 때는 아무것도 하지 않음
    }

    if (!user) {
      setIsLoginModalOpen(true); // 로딩이 완료되고 유저가 없을 때 모달을 열기
    }
  }, [user, userIsLoading, setIsLoginModalOpen]);

  return (
    <>
      <ChatHeader user={user} chatId={chatId} roomInfo={roomInfo} />
      <ChatMessage
        messages={messages}
        user={user}
        chatId={chatId}
        isLoading={messagesIsLoading}
      />
      <ChatInput user={user} chatId={chatId} />
    </>
  );
};
