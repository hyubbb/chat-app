"use client";
import React, { ElementRef, useEffect, useRef } from "react";
import { redirect, useRouter } from "next/navigation";

import { useStore } from "@/store/use-store";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/store/use-user-query";
import { RoomsType, UserType } from "@/types";
import { ChatHeader } from "./chat/Header";
import { ChatMessage } from "./chat/Message";
import { ChatInput } from "./chat/Input";

const ChatRoom = React.memo(
  ({
    chatId,
    roomInfo,
    usersList,
  }: {
    chatId: number;
    roomInfo: RoomsType;
    usersList: any;
  }) => {
    const { setIsLoginModalOpen } = useStore();
    const { data: user, isLoading: userIsLoading } = useUserQuery();
    const bottomRef = useRef<ElementRef<"div">>(null);

    useRoomSocket({ chatId, user });

    useEffect(() => {
      if (!chatId) return redirect("/");
    }, [chatId]);

    useEffect(() => {
      if (userIsLoading) {
        return;
      }
      if (!user) {
        setIsLoginModalOpen(true);
      }
    }, [user, userIsLoading, setIsLoginModalOpen]);

    return (
      <>
        <ChatHeader
          user={user}
          chatId={chatId}
          roomInfo={roomInfo}
          usersList={usersList}
        />
        <ChatMessage user={user} chatId={chatId} bottomRef={bottomRef} />
        <ChatInput user={user} chatId={chatId} bottomRef={bottomRef} />
      </>
    );
  },
);

ChatRoom.displayName = "ChatRoom";

export default ChatRoom;
