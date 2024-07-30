"use client";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { useMessageQuery } from "@/hooks/use-message.query";
import { useRoomSocket } from "@/hooks/use-room-socket";
import { useRoomStore } from "@/hooks/use-room-store";

import { useStore } from "@/hooks/use-store";
import { useUserQuery } from "@/hooks/use-user-query";
import { defaultUser, UserType } from "@/types";
import { dateFormatted, useInput } from "@/util/utils";
import axios from "axios";
import {
  EllipsisVertical,
  MessageCircleOff,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const ChatRoom = ({ chatId }: { chatId: number }) => {
  const { setIsLoginModalOpen } = useStore();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { selectedChat } = useRoomStore();
  const { data: user } = useUserQuery();
  useRoomSocket({ chatId, user: user });
  useMessageSocket({ chatId });
  const { data: messages } = useMessageQuery({ chatId });

  useEffect(() => {
    if (!chatId) return redirect("/");
    if (!user) return setIsLoginModalOpen(true);
    inputRef.current?.focus();
    // 처음에 채팅방참여 & 메세지 가져옴
    const handle = async () => {
      await axios.post(`/api/socket/chat/${chatId}`, {
        userId: user?.user_id,
        userName: user?.user_name,
      });
    };
    handle();
  }, [chatId, user]);

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef, messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    await axios.post("/api/socket/message", {
      userId: user?.user_id,
      chatId,
      message,
    });
  };
  const handleLeaveRoom = async () => {
    const { data } = await axios.patch(`/api/socket/chat/${chatId}`, {
      userId: user?.user_id,
      userName: user?.user_name,
    });
    if (data?.success) {
      router.push("/");
    }
  };
  return (
    <>
      <div className="flex items-center justify-between space-x-2 border-b bg-white p-4 dark:bg-zinc-800 dark:text-zinc-300">
        <div className="flex items-center gap-x-2">
          <MessageSquare size={20} className="text-blue-500" />
          <h2 className="font-semibold">{selectedChat?.room_name}</h2>
          {selectedChat?.active_users! > 0 && (
            <span className="text-sm text-gray-500">
              {`${selectedChat?.active_users}명 참여중`}
            </span>
          )}
        </div>
        <div className="group relative cursor-pointer">
          <EllipsisVertical size={20} />
          <div className="absolute right-0 top-0 hidden w-max flex-col gap-2 rounded-md bg-zinc-900 p-2 group-hover:flex">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 rounded-md p-2 text-left text-zinc-200 hover:bg-blue-100 hover:text-zinc-900"
            >
              <MessageCircleOff size={16} /> <span>방 나가기</span>
            </button>

            {user?.role === "admin" && (
              <button className="flex items-center gap-2 rounded-md p-2 text-left text-zinc-200 hover:bg-blue-100 hover:text-zinc-900">
                <Trash2 size={16} /> <span>방 삭제</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-y-2 overflow-y-auto dark:text-zinc-300">
        {/* Chat messages would go here */}
        {messages?.map(
          ({ message_id, user_name, sent_at, content, message_type }) => {
            if (message_type === "system") {
              return (
                <div
                  key={message_id}
                  className="text-md flex items-center justify-center text-gray-500"
                >
                  {content}
                </div>
              );
            }
            return (
              <div key={message_id} className={"flex items-center gap-x-3 p-2"}>
                <div className="h-12 w-12 rounded-full border-2 border-zinc-500/70"></div>
                <div className="flex flex-col items-start">
                  <div className="flex gap-x-3">
                    <span className="font-bold">{user_name}</span>
                    <span className="text-sm text-zinc-500/80">
                      {dateFormatted(sent_at)}
                    </span>
                  </div>
                  <span>{content}</span>
                </div>
              </div>
            );
          },
        )}
        <div ref={bottomRef}></div>
      </div>
      <div className="border-t-2 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="메시지를 입력하세요..."
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </form>
      </div>
    </>
  );
};
