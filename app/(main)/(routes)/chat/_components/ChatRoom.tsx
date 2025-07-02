"use client";
import React, { ElementRef, useEffect, useRef, useState } from "react";
import { redirect, useRouter } from "next/navigation";

import { useStore } from "@/store/use-store";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useUserQuery } from "@/store/use-user-query";
import { RoomsType, UserType } from "@/types";
import { Header } from "./chat-components/Header";
import { Message } from "./chat-components/Message";
import { Input } from "./chat-components/Input";
import Video from "@/components/video";

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
    const [showVideoCall, setShowVideoCall] = useState(false);

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

    const handleStartVideoCall = () => {
      setShowVideoCall(true);
    };

    // 그룹 채팅용 dmInfo 객체 생성
    const groupDmInfo = {
      id: chatId,
      room_id: `group_${chatId}`,
      user_id: user?.user_id || 0,
      other_id: 0, // 그룹 채팅은 특정 사용자가 없음
      other_name: roomInfo?.room_name || "그룹 채팅",
      other_photo_url: null,
      other_user_leave: null,
    };

    return (
      <div className="flex h-full flex-col">
        <Header
          user={user}
          chatId={chatId}
          roomInfo={roomInfo}
          usersList={usersList}
          onStartVideoCall={handleStartVideoCall}
        />

        {showVideoCall && (
          <div className="relative">
            <div className="absolute left-0 right-0 top-0 z-10 bg-black/5 backdrop-blur-sm">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {roomInfo?.room_name} - 그룹 영상통화
                  </h3>
                  <button
                    onClick={() => setShowVideoCall(false)}
                    className="rounded-full bg-black/50 p-2 text-white hover:text-gray-300"
                    aria-label="영상통화 창 닫기"
                  >
                    ✕
                  </button>
                </div>
                <Video dmInfo={groupDmInfo} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <Message user={user} chatId={chatId} bottomRef={bottomRef} />
          <Input user={user} chatId={chatId} bottomRef={bottomRef} />
        </div>
      </div>
    );
  },
);

ChatRoom.displayName = "ChatRoom";

export default ChatRoom;
