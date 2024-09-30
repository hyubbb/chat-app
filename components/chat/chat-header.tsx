import { RoomsType, UserType } from "@/types";
import axios from "axios";
import {
  EllipsisVertical,
  MessageCircleOff,
  MessageSquare,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ChatHeaderProps = {
  user: UserType | null;
  chatId: number;
  roomInfo: RoomsType;
  usersList: any;
};
export const ChatHeader = ({
  user,
  chatId,
  roomInfo,
  usersList,
}: ChatHeaderProps) => {
  const router = useRouter();
  const [listModal, setListModal] = useState<boolean>(false);

  // 방 나가기

  const handleLeaveRoom = async () => {
    const { data } = await axios.patch(`/api/socket/chat/${chatId}`, {
      userId: user?.user_id,
      userName: user?.user_name,
    });
    if (data?.success) {
      router.push("/");
    }
  };

  const handleUserList = () => {
    setListModal(!listModal);
  };

  // 유저 디렉트 메시지 이동
  const directMessage = ({ userId }: { userId: number | null }) => {
    if (userId !== user?.user_id) {
      router.push(`/direct/${userId}`);
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
        <div className="absolute right-0 top-5 hidden w-max flex-col gap-2 rounded-md bg-zinc-900 p-2 group-hover:flex">
          <button
            onClick={handleUserList}
            className="flex items-center gap-2 rounded-md p-2 text-left text-zinc-200 hover:bg-zinc-200 hover:text-zinc-800"
          >
            <Users size={16} /> <span>유저 목록</span>
          </button>
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 rounded-md p-2 text-left text-red-500 hover:bg-red-500 hover:text-zinc-100"
          >
            <MessageCircleOff size={16} /> <span>방 나가기</span>
          </button>
          {user?.role === "admin" && (
            <button className="flex items-center gap-2 rounded-md p-2 text-left text-zinc-200 hover:bg-blue-100 hover:text-zinc-900">
              <Trash2 size={16} /> <span>방 삭제</span>
            </button>
          )}
        </div>

        {listModal && (
          <div className="absolute right-0 top-0 z-20 w-[200px] rounded-md bg-zinc-900 p-3 pl-6 shadow-lg">
            <div
              onClick={() => setListModal(false)}
              className="flex justify-end"
            >
              <X />
            </div>
            <div className="flex flex-col gap-y-4">
              {usersList?.map((user: UserType) => (
                <div
                  onClick={() => directMessage({ userId: user?.user_id })}
                  key={user.user_id}
                  className="flex items-center gap-2"
                >
                  {user?.photo_url ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                      <Image
                        src={user.photo_url}
                        alt={user.user_name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-black"></div>
                  )}
                  <span className="text-zinc-200">{user?.user_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
