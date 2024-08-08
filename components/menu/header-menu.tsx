"use client";
import { useUserQuery } from "@/store/use-user-query";
import { Login } from "../auth/log-in";
import { Logout } from "../auth/log-out";
import { Loading } from "../loading";
import { LoginModal } from "../modal/login-modal";
import { EditModal } from "../modal/edit-modal";
import { UserType } from "@/types";
import { Climate_Crisis } from "next/font/google";
import { useEffect, useState } from "react";

const climateCrisis = Climate_Crisis({
  subsets: ["latin"],
  weight: ["400"],
});

export const HeaderMenu = ({ user: initUser }: { user: UserType }) => {
  const { data: userData, refetch, isLoading } = useUserQuery();
  const [user, setUser] = useState<UserType>(initUser);
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);
  return (
    <header className="dark:text-zinc-3 flex h-[70px] w-full items-center justify-between border-b-2 border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800">
      <div className={`text-3xl text-zinc-50 ${climateCrisis.className}`}>
        CHAT APP
      </div>

      {user && user.id ? <Logout user={user} /> : <Login />}
      <LoginModal />
      <EditModal user={user} />
    </header>
  );
};
