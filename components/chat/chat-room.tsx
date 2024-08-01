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
import { useMessageQuery } from "@/hooks/use-message.query";

export const ChatRoom = ({ chatId }: { chatId: number }) => {
  const { setIsLoginModalOpen } = useStore();
  const { data: user } = useUserQuery();
  const { data: messages } = useMessageQuery({
    chatId,
    user: user ?? defaultUser,
  });
  useRoomSocket({ chatId, user: user });
  useMessageSocket({ chatId });

  useEffect(() => {
    if (!chatId) return redirect("/");
    if (!user?.id) return setIsLoginModalOpen(true);
  }, [user]);

  return (
    <>
      <ChatHeader user={user} chatId={chatId} />
      <ChatMessage messages={messages} user={user} chatId={chatId} />
      <ChatInput user={user} chatId={chatId} />
    </>
  );
};
