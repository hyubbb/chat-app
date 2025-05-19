"use client";
import Link from "next/link";
import { Climate_Crisis } from "next/font/google";
import { EllipsisVertical } from "lucide-react";

import { useStore } from "@/store/use-store";
import { useUserQuery } from "@/store/use-user-query";

import { Login } from "@/app/(auth)/_components/log-in";
import { Logout } from "@/app/(auth)/_components/log-out";
import { LoginModal } from "@/components/modal/login-modal";
import { EditModal } from "@/components/modal/edit-modal";
import { UserType } from "@/types";
import { withAuthComponent } from "@/HOC/withAuthComponent";

const climateCrisis = Climate_Crisis({
  subsets: ["latin"],
  weight: ["400"],
});

export const HeaderMenu = ({ user: initUser }: { user: UserType }) => {
  const { data: user, refetch } = useUserQuery(initUser);
  const { setIsMenuModalOpen } = useStore();
  refetch();
  // 로그인 처리를 위한 HOC 컴포넌트 생성
  const AuthStatusWithAuthComponent = withAuthComponent(Login, Logout);
  const handleOpenRooms = () => {
    setIsMenuModalOpen(true);
  };
  return (
    <header className="dark:text-zinc-3 flex h-[70px] w-full items-center justify-between border-b-2 border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800">
      <Link href="/">
        <div
          className={`text-3xl text-zinc-50 max-sm:text-lg ${climateCrisis.className}`}
        >
          CHAT APP
        </div>
      </Link>
      <div className="hidden max-sm:block" onClick={handleOpenRooms}>
        <EllipsisVertical size={20} className="text-zinc-50" />
      </div>
      <div className="max-sm:hidden">
        <AuthStatusWithAuthComponent user={user} />
      </div>
      <LoginModal />
      <EditModal user={user} />
    </header>
  );
};
