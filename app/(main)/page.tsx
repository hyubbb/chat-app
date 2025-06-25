"use client";
import { useRoomQuery } from "@/hooks/use-room-query";
import { useRoomStore } from "@/store/use-room-store";
import { useUserQuery } from "@/store/use-user-query";
import { RoomsType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HomePage = () => {
  const { selected: roomsInCategory, setSelectedChat } = useRoomStore();
  const { data: user } = useUserQuery();
  const router = useRouter();
  const [rooms, setRooms] = useState<any>([]);
  const queryClient = useQueryClient();

  // 선택된 카테고리(roomsInCategory)의 채팅방 목록을 가져옴
  const { roomsData } = useRoomQuery({
    categories: roomsInCategory,
  });

  useEffect(() => {
    if (!roomsInCategory) {
      setRooms(roomsData);
    } else {
      const filteredRooms = roomsInCategory.rooms;
      setRooms(filteredRooms);
    }
  }, [roomsData, roomsInCategory]);

  const handleChatClick = (chat_id: number) => {
    const room = rooms.find((room: any) => room.chat_id == chat_id);
    if (room) {
      setSelectedChat(room);
      router.push(`/chat/${chat_id}`);
    }
  };

  const handleDelete = async (chat_id: number) => {
    await axios.delete(`api/socket/chat/${chat_id}`);
  };
  return (
    <>
      {/* Main chat area */}
      <main className="flex h-full w-full flex-1 flex-col bg-gray-50 dark:bg-zinc-800">
        {/*  채팅방 목록 화면 , 카테고리가 선택이 되었고, 채팅방이 존재할 때 */}
        <div className="p-4">
          <h2 className="mb-4 text-xl font-bold dark:text-zinc-300">
            {roomsInCategory?.category_name} 채팅방
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms?.map(
              (
                { chat_id, room_name, user_count, user_id }: RoomsType,
                idx: number,
              ) => (
                <div
                  key={chat_id}
                  className="group cursor-pointer rounded-lg bg-white p-4 shadow transition hover:shadow-md"
                  onClick={() => handleChatClick(chat_id)}
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
                    {`${user_count}명 참여중`}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </main>
    </>
  );
};
export default HomePage;
