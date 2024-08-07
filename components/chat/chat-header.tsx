import { useRoomStore } from "@/hooks/use-room-store";
import { RoomsType, UserType } from "@/types";
import axios from "axios";
import {
  EllipsisVertical,
  MessageCircleOff,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ChatHeaderProps = {
  user: UserType | null;
  chatId: number;
  roomInfo: RoomsType;
};

export const ChatHeader = ({ user, chatId, roomInfo }: ChatHeaderProps) => {
  const { selectedChat } = useRoomStore();
  const router = useRouter();

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
    <div className="flex items-center justify-between space-x-2 border-b bg-white p-4 dark:bg-zinc-800 dark:text-zinc-300">
      <div className="flex items-center gap-x-2">
        <MessageSquare size={20} className="text-blue-500" />
        <h2 className="font-semibold">{roomInfo?.room_name}</h2>
        {roomInfo?.user_count! > 0 && (
          <span className="text-sm text-gray-500">
            {`${roomInfo?.user_count}명 참여중`}
          </span>
        )}
      </div>
      <div className="group relative cursor-pointer">
        <EllipsisVertical size={20} />
        <div className="absolute right-0 top-0 hidden w-max flex-col gap-2 rounded-md bg-zinc-900 p-2 group-hover:flex">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 rounded-md p-2 text-left text-zinc-200 hover:bg-red-500 hover:text-zinc-100"
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
  );
};
