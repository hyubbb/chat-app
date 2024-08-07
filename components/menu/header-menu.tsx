"use client";
import { useUserQuery } from "@/store/use-user-query";
import { Login } from "../auth/log-in";
import { Logout } from "../auth/log-out";
import { Loading } from "../loading";
import { LoginModal } from "../modal/login-modal";
import { EditModal } from "../modal/edit-modal";

export const HeaderMenu = () => {
  const { data: user, refetch, isLoading } = useUserQuery();
  refetch();

  return (
    <header className="dark:text-zinc-3 flex h-[70px] border-b-2 border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800">
      {user && user.id ? <Logout user={user} /> : <Login />}
      <LoginModal />
      <EditModal user={user} />
    </header>
  );
};
