"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";

import { useStore } from "@/hooks/use-store";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/hooks/use-user-query";
import { defaultUser } from "@/types";

import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { useDirectSocket } from "@/hooks/use-direct-socket";
import { useDirectQuery } from "@/hooks/use-direct-query";

export const DirectRoom = ({ chatId }: { chatId: number }) => {
  const { setIsLoginModalOpen } = useStore();
  const { data: user } = useUserQuery();
  useRoomSocket({ chatId, user: user });
  useDirectSocket({ toId: chatId, user });

  const { messages, dmList } = useDirectQuery({
    chatId,
    user: user ?? defaultUser,
    direct: true,
  });

  const dmInfo = dmList!.find((dm) => dm.other_id === chatId) || null;

  useEffect(() => {
    if (!chatId) return redirect("/");
    if (!user?.user_id) return setIsLoginModalOpen(true);
  }, [user]);

  return (
    <>
      <ChatHeader user={user} chatId={chatId} dmInfo={dmInfo} />
      <ChatMessage messages={messages} user={user} chatId={chatId} />
      <ChatInput user={user} chatId={chatId} />
    </>
  );
};
