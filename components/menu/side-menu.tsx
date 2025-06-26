"use client";
import React, { useState, useEffect } from "react";
import { Plus, XCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  CategoriesType,
  CollapseStateType,
  dmListType,
  UserType,
} from "@/types";
import { cn } from "@/util/utils";

import { useUserQuery } from "@/store/use-user-query";
import { useStore } from "@/store/use-store";
import { useEsc } from "@/hooks/use-esc";
import { useRoomStore } from "@/store/use-room-store";
import { useRoomQuery } from "@/hooks/use-room-query";
import { useCategoryQuery } from "@/hooks/use-category-query";
import { useDirectQuery } from "@/hooks/use-direct-query";
import { useQueryClient } from "@tanstack/react-query";

import { RoomCreateModal } from "@/components/room/room-create-modal";
import { Logout } from "@/app/(auth)/_components/log-out";
import { Login } from "@/app/(auth)/_components/log-in";
import { SideMenuDirect } from "./side-menu-direct";
import { SideMenuCategory } from "./side-menu-category";
import { SideMenuEntered } from "./side-menu-entered";
import { useCategorySocket } from "@/hooks/use-category-socket";

type SideMenuProps = {
  user: UserType;
  dmList: dmListType[];
  categories: CategoriesType[];
};

export const SideMenu = ({
  user: initUser,
  dmList: initDmList,
  categories: initCategories,
}: SideMenuProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapseState, setCollapseState] = useState<CollapseStateType>({
    dm: false,
    room: false,
    entered: false,
  });

  useCategorySocket();
  useEsc(setIsModalOpen);

  const { isMenuModalOpen, setIsMenuModalOpen } = useStore();
  const { setSelected, selected } = useRoomStore();

  const { data: user } = useUserQuery(initUser);
  const { dmList: dmList } = useDirectQuery({ user, initDmList });
  const { data: categories } = useCategoryQuery({ initCategories });
  const { joinRoomData, isJoinRoomError, isJoinRoomLoading } = useRoomQuery({
    userId: user?.user_id,
  });

  // 전역 DM 소켓 로직 - 모든 페이지에서 실행
  const { socket, isConnected } = useStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !user?.user_id) {
      console.log(`❌ 전역 DM 이벤트 등록 실패:`, {
        socket: !!socket,
        isConnected,
        userId: user?.user_id,
      });
      return;
    }

    console.log(`🌐 전역 DM 이벤트 리스너 등록 - 사용자: ${user.user_id}`);
    console.log(`🔗 Socket 연결 상태:`, socket.connected);

    // 사용자를 userRoom에 join시키기
    socket.emit("joinRoom", { userId: user.user_id.toString() });
    console.log(`🔗 사용자 ${user.user_id}를 userRoom에 join 시킴`);

    const handleRefreshDmList = () => {
      console.log("🔥🔥🔥 refreshDmList 이벤트 수신!!! 🔥🔥🔥");
      console.log("📱 현재 사용자 ID:", user?.user_id);
      console.log("⏰ 수신 시간:", new Date().toLocaleTimeString());

      if (user?.user_id) {
        console.log("🚀🚀🚀 dmList 갱신 시작!!! 🚀🚀🚀");
        queryClient.invalidateQueries({
          queryKey: ["dmList", user.user_id],
        });
        queryClient.refetchQueries({
          queryKey: ["dmList", user.user_id],
        });
        console.log("✅✅✅ dmList 갱신 완료!!! ✅✅✅");
      }
    };

    socket.on("refreshDmList", handleRefreshDmList);

    return () => {
      console.log(`🌐 전역 DM 이벤트 리스너 해제 - 사용자: ${user.user_id}`);
      socket.off("refreshDmList", handleRefreshDmList);
    };
  }, [socket, isConnected, user?.user_id, queryClient]);

  const handleCategoryClick = (category: CategoriesType) => {
    setSelected(category);
    setIsMenuModalOpen(false);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const toggleCollapse = (key: string) => {
    setCollapseState((state: any) => ({
      ...state,
      [key]: !state[key],
    }));
  };

  return (
    <aside className="w-64 overflow-y-scroll border-b-2 border-r bg-white scrollbar-hide max-sm:w-full dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {/* Direct Messages - 접을 수 있는 기능 */}

      {user?.id && (
        <SideMenuDirect
          toggleCollapse={toggleCollapse}
          collapseState={collapseState}
          dmList={dmList}
          user={user}
        />
      )}

      {/* Chat Rooms List */}
      <div
        className={cn(
          "max-sm:hidden",
          isMenuModalOpen
            ? "absolute left-0 top-0 z-30 h-full w-full flex-col bg-black max-sm:flex"
            : "block",
        )}
      >
        <div className="hidden h-16 w-full items-center justify-end border-b-[1px] pr-4 max-sm:flex">
          <XCircle onClick={() => setIsMenuModalOpen(false)} />
        </div>
        <div className="overflow-y-auto p-4 max-sm:w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">채팅방</h2>
            {user && user.id && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mr-1 rounded p-1 text-blue-500 hover:bg-blue-100"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          <div className="space-y-4">
            {/* 전체 채팅방 (카테고리) */}
            <SideMenuCategory
              toggleCollapse={toggleCollapse}
              collapseState={collapseState}
              categories={categories}
              handleCategoryClick={handleCategoryClick}
              selected={selected}
            />
            {/* 참여중인 채팅방 - 변경 없음 */}
            {user && user.id && (
              <SideMenuEntered
                toggleCollapse={toggleCollapse}
                collapseState={collapseState}
                joinRoomData={joinRoomData}
              />
            )}
          </div>
        </div>
        {isMenuModalOpen && (
          <div className="flex w-full">
            {user && user.id ? <Logout user={user} /> : <Login />}
          </div>
        )}
      </div>
      <RoomCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        user={user}
      />
    </aside>
  );
};
