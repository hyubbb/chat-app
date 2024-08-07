import { CollapseStateType } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type SideMenuEnteredProps = {
  toggleCollapse: (key: string) => void;
  collapseState: CollapseStateType;
  joinRoomData: any;
};

export const SideMenuEntered = ({
  toggleCollapse,
  collapseState,
  joinRoomData,
}: SideMenuEnteredProps) => {
  const router = useRouter();

  const handleChatRoomClick = (chatId: number) => {
    // 채팅방 클릭시 이동할 페이지
    router.push(`/chat/${chatId}`);
  };

  return (
    <div>
      <div
        className="mb-2 flex cursor-pointer items-center justify-between"
        onClick={() => toggleCollapse("entered")}
      >
        <div className="flex w-full items-center gap-x-2">
          <h3 className="text-sm font-medium text-gray-500">참여중인 채팅방</h3>
          {joinRoomData?.length > 0 && (
            <span className="m-0 p-0 text-xs text-gray-400">
              ({joinRoomData?.length})
            </span>
          )}
        </div>
        <div className="mr-2">
          {collapseState.entered ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </div>
      {!collapseState.entered && (
        <ul className="space-y-1">
          {joinRoomData?.map(({ chat_id, room_name, user_count }: any) => (
            <li
              onClick={() => handleChatRoomClick(chat_id)}
              key={chat_id}
              className="flex cursor-pointer items-center justify-between rounded p-2 text-sm hover:bg-gray-100"
            >
              <span>{room_name}</span>
              <span className="rounded-full bg-green-200 px-2 py-1 text-xs text-green-700">
                {user_count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
