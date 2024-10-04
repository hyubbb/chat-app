"use client";
import React, { useState } from "react";
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
import { UseEsc } from "@/hooks/useEsc";
import { useRoomStore } from "@/hooks/use-room-store";
import { useRoomQuery } from "@/hooks/use-room-query";
import { useCategoryQuery } from "@/hooks/use-category-query";
import { useDirectQuery } from "@/hooks/use-direct-query";

import { RoomCreateModal } from "@/components/room/room-create-modal";
import { Logout } from "@/components/auth/log-out";
import { Login } from "@/components/auth/log-in";
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
  UseEsc(setIsModalOpen);

  const { isMenuModalOpen, setIsMenuModalOpen } = useStore();
  const { setSelected, selected } = useRoomStore();

  const { data: user } = useUserQuery(initUser);
  const { dmList: dmList } = useDirectQuery({ user, initDmList });
  const { data: categories } = useCategoryQuery({ initCategories });
  const { joinRoomData, isJoinRoomError, isJoinRoomLoading } = useRoomQuery({
    userId: user?.user_id,
  });
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

      {user && user.id && (
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
