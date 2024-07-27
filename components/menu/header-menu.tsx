"use client";
import { useUserQuery } from "@/hooks/use-user-query";
import { LogOut } from "lucide-react";

export const HeaderMenu = () => {
  const { data: user } = useUserQuery();

  return (
    <header className="dark:text-zinc-3 flex h-[70px] items-center justify-between border-b-2 border-zinc-700 bg-white p-4 shadow-sm dark:bg-zinc-800">
      <div className="flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
          JD
        </div>
        <span className="font-semibold dark:text-zinc-300">
          {user?.userName}
        </span>
      </div>
      <button className="flex items-center space-x-1 rounded-md bg-red-500 px-3 py-1 text-white transition hover:bg-red-600">
        <LogOut size={18} />
        <span>로그아웃</span>
      </button>
    </header>
  );
};
