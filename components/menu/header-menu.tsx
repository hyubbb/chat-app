"use client";
import { useUserQuery } from "@/store/use-user-query";
<<<<<<< HEAD
import { Login } from "../auth/log-in";
import { Logout } from "../auth/log-out";
import { LoginModal } from "../modal/login-modal";
import { EditModal } from "../modal/edit-modal";
=======

import { Login } from "@/components/auth/log-in";
import { Logout } from "@/components/auth/log-out";
import { LoginModal } from "@/components/modal/login-modal";
import { EditModal } from "@/components/modal/edit-modal";
>>>>>>> 7e50f8a (feat: JWT토큰 리프레시 토큰 추가)
import { UserType } from "@/types";
import { Climate_Crisis } from "next/font/google";
import Link from "next/link";
import { useStore } from "@/store/use-store";
import { EllipsisVertical } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useDirectSocket } from "@/hooks/use-direct-socket";

const climateCrisis = Climate_Crisis({
  subsets: ["latin"],
  weight: ["400"],
});

export const HeaderMenu = ({ user: initUser }: { user: UserType }) => {
  const { data: user, refetch } = useUserQuery(initUser);
  const { setIsMenuModalOpen } = useStore();
  refetch();
<<<<<<< HEAD
  useSocket({ initUser });
  useDirectSocket({ user });
=======
  // 로그인 처리를 위한 HOC 컴포넌트 생성
  const AuthStatusWithAuthComponent = withAuthComponent(Login, Logout);
>>>>>>> 7e50f8a (feat: JWT토큰 리프레시 토큰 추가)
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
<<<<<<< HEAD
        {user && user.id ? <Logout user={user} /> : <Login />}
=======
        <AuthStatusWithAuthComponent user={user} />
>>>>>>> 7e50f8a (feat: JWT토큰 리프레시 토큰 추가)
      </div>
      <LoginModal />
      <EditModal user={user} />
    </header>
  );
};
