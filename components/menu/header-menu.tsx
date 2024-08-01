"use client";
import { useUserQuery } from "@/hooks/use-user-query";
import { LogOut } from "lucide-react";
import { Login } from "../auth/login-in";
import { Logout } from "../auth/log-out";

export const HeaderMenu = () => {
  const { data: user } = useUserQuery();

  return (
    <header className="dark:text-zinc-3 flex h-[70px] border-b-2 border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800">
      {user && user.id ? <Login user={user} /> : <Logout />}
    </header>
  );
};
