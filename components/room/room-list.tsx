"use client";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { RoomsType } from "@/types";
import { useRoomStore } from "@/hooks/use-room-store";
import { useRoomQuery } from "@/hooks/use-room-query";
import { useUserQuery } from "@/store/use-user-query";

export const RoomList = () => {
<<<<<<< HEAD
  const [selectedRoom, _] = useState<RoomsType | null>(null);
=======
>>>>>>> 868249151e5c197e422d8a160e6cc717e549299a
  const { selected: roomsInCategory, setSelectedChat } = useRoomStore();
  const { data: user } = useUserQuery();
  const router = useRouter();
  const handleChatClick = (chat: any) => {
    setSelectedChat(chat);
    router.push(`/chat/${chat.chat_id}`);
  };

  // 선택된 카테고리(roomsInCategory)의 채팅방 목록을 가져옴
  const { categoryData: rooms } = useRoomQuery({
    categories: roomsInCategory,
  });

  const handleDelete = async (chat_id: number) => {
    await axios.delete(`api/socket/chat/${chat_id}`);
  };
  return (
    <>
      {/* Main chat area */}
      <main className="flex h-full w-full flex-1 flex-col bg-gray-50 dark:bg-zinc-800">
        {roomsInCategory ? (
          // 채팅방 목록 화면 , 카테고리가 선택이 되었고, 채팅방이 존재할 때
          <div className="p-4">
            <h2 className="mb-4 text-xl font-bold dark:text-zinc-300">
              {roomsInCategory.category_name} 채팅방
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms?.map(
                (
                  { chat_id, room_name, user_count, user_id }: RoomsType,
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
                      {`${user_count}명 참여중`}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          // 초기 화면, 카테고리가 선택이 되지 않았을 때
          <div className="dark:text-zinc-3 flex h-full items-center justify-center dark:bg-zinc-800">
            <p className="text-xl text-gray-500">
              {user && user.user_id
                ? "채팅방을 선택해주세요"
                : "로그인 해주세요"}
            </p>
          </div>
        )}
      </main>
    </>
  );
};
