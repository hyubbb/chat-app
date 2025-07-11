import { useRoomStore } from "@/store/use-room-store";
import { dmListType, UserType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  EllipsisVertical,
  MessageCircleOff,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Video from "@/components/video";

type ChatHeaderProps = {
  user: UserType | null;
  chatId: number;
  dmInfo: dmListType | null;
};

export const ChatHeader = ({ user, chatId, dmInfo }: ChatHeaderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLeaveDM = async () => {
    try {
      // 상대방이 이미 나간 상태인지 확인 (other_user_leave가 1인 경우)
      const isOtherUserAlreadyLeft = dmInfo?.other_user_leave === 1;

      const { data } = await axios.patch(`/api/socket/direct/${chatId}`, {
        userId: user?.user_id,
        userName: user?.user_name,
        roomId: dmInfo?.room_id,
        otherUserLeave: isOtherUserAlreadyLeft,
      });

      if (data?.success) {
        // dmList 즉시 업데이트
        if (user?.user_id) {
          queryClient.invalidateQueries({
            queryKey: ["dmList", user.user_id],
          });
        }
        router.push("/");
      }
    } catch (error) {
      console.error("방 나가기 실패:", error);
    }
  };

  return (
    <div className="flex items-center justify-between space-x-2 border-b bg-white p-4 dark:bg-zinc-800 dark:text-zinc-300">
      <div className="flex items-center gap-x-2">
        <MessageSquare size={20} className="text-blue-500" />
        <h2 className="font-semibold">{dmInfo?.other_name}</h2>
      </div>

      <div className="relative flex cursor-pointer items-center justify-center gap-3">
        <Video dmInfo={dmInfo} />
        <div className="group">
          <EllipsisVertical size={20} />
          <div className="absolute right-0 top-0 hidden w-max flex-col gap-2 rounded-md bg-zinc-900 p-2 group-hover:flex">
            <button
              onClick={handleLeaveDM}
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
    </div>
  );
};
