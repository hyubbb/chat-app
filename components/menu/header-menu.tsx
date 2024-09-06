"use client";
import { useUserQuery } from "@/store/use-user-query";
import { Login } from "../auth/log-in";
import { Logout } from "../auth/log-out";
import { LoginModal } from "../modal/login-modal";
import { EditModal } from "../modal/edit-modal";
import { UserType } from "@/types";
import { Climate_Crisis } from "next/font/google";
import Link from "next/link";
import { useStore } from "@/store/use-store";
import { EllipsisVertical } from "lucide-react";

const climateCrisis = Climate_Crisis({
  subsets: ["latin"],
  weight: ["400"],
});

export const HeaderMenu = ({ user: initUser }: { user: UserType }) => {
  const { data: user, refetch } = useUserQuery(initUser);
  const { isMenuModalOpen, setIsMenuModalOpen } = useStore();
  refetch();
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
        {user && user.id ? <Logout user={user} /> : <Login />}
      </div>
      <LoginModal />
      <EditModal user={user} />
    </header>
  );
};
