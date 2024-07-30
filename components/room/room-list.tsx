"use client";
import React, { useState } from "react";
import { useRoomStore } from "@/hooks/use-room-store";
import { defaultCategories, RoomsType } from "@/types";
import { useRouter } from "next/navigation";
import { useRoomQuery } from "@/hooks/use-room-query";
import { Trash } from "lucide-react";
import { useUserQuery } from "@/hooks/use-user-query";
import axios from "axios";

export const RoomList = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [rooms, setRooms] = useState<RoomsType[]>();
  const [selectedRoom, setSelectedRoom] = useState<RoomsType | null>(null);
  const { selected: roomsInCategory, setSelectedChat } = useRoomStore();
  const { data: user } = useUserQuery();
  const router = useRouter();
  const handleChatClick = (chat: any) => {
    setSelectedChat(chat);
    router.push(`/chat/${chat.chat_id}`);
  };

  const { categoryData: rooms } = useRoomQuery({
    categories: roomsInCategory ?? defaultCategories,
  });

  const handleDelete = async (chat_id: number) => {
    const { data } = await axios.delete(`api/socket/chat/${chat_id}`);
  };
  return (
    <>
      {/* Main chat area */}
      <main className="flex h-full w-full flex-1 flex-col bg-gray-50 dark:bg-zinc-800">
        {roomsInCategory && selectedRoom == null ? (
          // 채팅방 목록 화면 , 카테고리가 선택이 되었고, 채팅방이 존재할 때
          <div className="p-4">
            <h2 className="mb-4 text-xl font-bold dark:text-zinc-300">
              {roomsInCategory.category_name} 채팅방
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms?.map(
                (
                  { chat_id, room_name, active_users, user_id }: RoomsType,
                  idx,
                ) => (
                  <div
                    key={chat_id}
                    className="group cursor-pointer rounded-lg bg-white p-4 shadow transition hover:shadow-md"
                    onClick={() => handleChatClick(rooms[idx])}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{room_name}</h3>
                      {user_id === user?.user_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chat_id);
                          }}
                          className="z-10 hidden text-red-600 group-hover:block"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {`${active_users}명 참여중`}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          // 초기 화면
          <div className="dark:text-zinc-3 flex h-full items-center justify-center dark:bg-zinc-800">
            <p className="text-xl text-gray-500">채팅방을 선택해주세요</p>
          </div>
        )}
      </main>
    </>
  );
};
