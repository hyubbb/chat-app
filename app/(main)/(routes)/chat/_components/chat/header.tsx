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
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlertModal } from "@/store/use-alert-modal";

type ChatHeaderProps = {
  user: UserType | null;
  chatId: number;
  roomInfo: RoomsType;
  usersList: any;
};

export const Header = ({
  user,
  chatId,
  roomInfo,
  usersList,
}: ChatHeaderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const alertModal = useAlertModal();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [listModal, setListModal] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowMenu(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 300); // 300ms 지연 시간
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 방 나가기
  const handleLeaveRoom = async () => {
    try {
      const { data } = await axios.patch(`/api/socket/chat/${chatId}`, {
        userId: user?.user_id,
        userName: user?.user_name,
      });

      if (data?.success) {
        // 캐시된 데이터 업데이트
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["categories"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["joinRoomList"],
          }),
          // // rooms 쿼리도 갱신 (전체 채팅방 목록)
          // queryClient.invalidateQueries({
          //   queryKey: ["rooms"],
          // }),
        ]);

        router.refresh();
        router.push("/");
      } else {
        throw new Error("채팅방을 나가는데 실패했습니다.");
      }
    } catch (error) {
      alertModal.open({
        title: "오류",
        description: "채팅방을 나가는데 실패했습니다. 다시 시도해주세요.",
        confirmLabel: "확인",
      });
    }
  };

  const handleUserList = useCallback(() => {
    setListModal(true);
  }, []);

  // 유저 디렉트 메시지 이동
  const directMessage = ({ id }: { id: number | null }) => {
    if (id !== user?.user_id) {
      router.push(`/direct/${id}`);
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
      <div
        ref={menuRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="rounded-full p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <EllipsisVertical size={20} />
        </button>
        <div
          className={`absolute right-0 top-full z-20 mt-1 w-max min-w-[160px] rounded-md bg-white shadow-lg transition-all duration-200 ease-in-out dark:bg-zinc-900 ${showMenu ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"} `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col py-1">
            <button
              onClick={handleUserList}
              className="flex items-center gap-2 px-4 py-2 text-left hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Users size={16} /> <span>유저 목록</span>
            </button>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <MessageCircleOff size={16} /> <span>방 나가기</span>
            </button>
            {user?.role === "admin" && (
              <button className="flex items-center gap-2 px-4 py-2 text-left hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                <Trash2 size={16} /> <span>방 삭제</span>
              </button>
            )}
          </div>
        </div>

        {listModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold dark:text-zinc-100">
                  참여자 목록
                </h3>
                <button
                  onClick={() => setListModal(false)}
                  className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {usersList?.map(({ id, user_name, photo_url }: UserType) => {
                    const isCurrentUser = user_name === user?.user_name;

                    return (
                      <div
                        key={id}
                        onClick={() => !isCurrentUser && directMessage({ id })}
                        className={`flex items-center gap-3 rounded-lg p-2 ${
                          !isCurrentUser
                            ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            : "cursor-default"
                        }`}
                      >
                        {photo_url ? (
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                            <Image
                              src={photo_url}
                              alt={user_name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <span className="text-lg font-medium">
                              {user_name[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium dark:text-zinc-200">
                            {user_name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-sm text-zinc-500">
                              (본인)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
