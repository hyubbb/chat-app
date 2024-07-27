"use client";
import React, { use, useEffect, useState } from "react";
import { useRoomStore } from "@/hooks/use-room.store";
import { RoomsType } from "@/types";
import { useRouter } from "next/navigation";
import { useRoomQuery } from "@/hooks/use-room-query";

export const RoomList = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const [rooms, setRooms] = useState<RoomsType[]>();
  const [selectedRoom, setSelectedRoom] = useState<RoomsType | null>(null);
  const { selected: roomsInCategory, setSelectedChat } = useRoomStore();
  const {
    categoryData: rooms,
    isCategoryError,
    isCategoryLoading,
  } = useRoomQuery({ categoryId: roomsInCategory?.category_id });

  const router = useRouter();
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleRoomClick = (chat_id: RoomsType) => {
    // console.log(room);
    setSelectedChat(chat_id);
    router.push(`/chat/${chat_id}`);
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
              {rooms?.map((room) => {
                const { chat_id, room_name, active_users } = room;
                return (
                  <div
                    key={room_name}
                    className="cursor-pointer rounded-lg bg-white p-4 shadow transition hover:shadow-md"
                    onClick={() => handleRoomClick(chat_id)}
                  >
                    <h3 className="font-semibold">{room_name}</h3>
                    <p className="text-sm text-gray-500">{!!active_users && `${active_users}명 참여중`}</p>
                  </div>
                );
              })}
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
