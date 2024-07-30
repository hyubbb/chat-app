"use client";
import { useRoomStore } from "@/hooks/use-room-store";
import {
  CategoriesType,
  CollapseStateType,
  defaultUser,
  UserType,
} from "@/types";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import RoomCreateModal from "../room/room-create-modal";
import { SideMenuDirect } from "./side-menu-direct";
import { SideMenuCategory } from "./side-menu-category";
import { SideMenuEntered } from "./side-menu-entered";
import { useCategoryQuery } from "@/hooks/use-category-query";
import { useRoomQuery } from "@/hooks/use-room-query";
import { useUserQuery } from "@/hooks/use-user-query";
import { useCategorySocket } from "@/hooks/use-category-socket";

export const SideMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapseState, setCollapseState] = useState<CollapseStateType>({
    dm: false,
    room: false,
    entered: false,
  });
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useUserQuery();
  const { setSelected, selected } = useRoomStore();

  // 카테고리 데이터 socket
  useCategorySocket();
  const {
    data: categories,
    isLoading,
    isError,
  } = useCategoryQuery({ user: user ?? defaultUser });

  // 참여중인 채팅방 데이터
  const { joinRoomData, isJoinRoomError, isJoinRoomLoading } = useRoomQuery({
    userId: user?.user_id ?? defaultUser.user_id,
  });

  const handleCategoryClick = (category: CategoriesType) => {
    setSelected(category);
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
    <aside className="w-64 overflow-y-scroll border-r bg-white scrollbar-hide dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {/* Direct Messages - 접을 수 있는 기능 */}
      <SideMenuDirect
        toggleCollapse={toggleCollapse}
        collapseState={collapseState}
      />

      {/* Chat Rooms List */}
      <div className="h-full overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">채팅방</h2>
          {user && (
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
          <SideMenuEntered
            toggleCollapse={toggleCollapse}
            collapseState={collapseState}
            joinRoomData={joinRoomData}
          />
        </div>
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
