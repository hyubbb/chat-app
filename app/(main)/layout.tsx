import { HeaderMenu } from "@/components/menu/header-menu";
import { SideMenu } from "@/components/menu/side-menu";
import {
  fetchCategories,
  fetchCookiesUser,
  fetchDmList,
} from "../actions/actions";

import React from "react";
import { cookies } from "next/headers";

const loginAuth = async () => {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("chat-token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `chat-token=${token?.value}`,
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in loginAuth:", error);
    return null;
  }
};

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  // const { user } = await loginAuth();
  const resUser = await fetchCookiesUser();
  const user = (await resUser?.json())?.user;

  const resDmList = await fetchDmList(user);
  const dmList = (await resDmList?.json())?.data;

  const resCategories = await fetchCategories();
  const categories = await resCategories.json();

  return (
    <div className="flex h-screen flex-col">
      <HeaderMenu user={user} />
      <div className="flex h-[calc(100vh-70px)] overflow-hidden max-sm:flex-col max-sm:overflow-auto">
        <SideMenu user={user} dmList={dmList} categories={categories} />
        <main className="flex flex-1 flex-col overflow-auto dark:bg-zinc-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
