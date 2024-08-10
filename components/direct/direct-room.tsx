"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";

import { useStore } from "@/store/use-store";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/store/use-user-query";
import { defaultUser } from "@/types";

import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { useDirectSocket } from "@/hooks/use-direct-socket";
import { useDirectQuery } from "@/hooks/use-direct-query";
import { Loading } from "../loading";

export const DirectRoom = ({ chatId }: { chatId: number }) => {
  const { setIsLoginModalOpen } = useStore();
  const { data: user, isLoading: userIsLoading } = useUserQuery();
  useRoomSocket({ chatId, user: user });
  useDirectSocket({ toId: chatId, user });
  const { messages, dmList, messagesIsLoading } = useDirectQuery({
    chatId,
    user,
  });

  const dmInfo = dmList?.find((dm) => dm.other_id === chatId) || null;

  useEffect(() => {
    if (chatId === user?.user_id) return redirect("/");
  }, [chatId, user]);

  useEffect(() => {
    if (userIsLoading) {
      return; // 로딩 중일 때는 아무것도 하지 않음
    }

    if (!user) {
      setIsLoginModalOpen(true); // 로딩이 완료되고 유저가 없을 때 모달을 열기
    }
  }, [user, userIsLoading, setIsLoginModalOpen]);

  if (userIsLoading || messagesIsLoading) return <Loading />;

  return (
    <>
      <ChatHeader user={user} chatId={chatId} dmInfo={dmInfo} />
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
