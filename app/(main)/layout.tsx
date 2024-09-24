import { HeaderMenu } from "@/components/menu/header-menu";
import { SideMenu } from "@/components/menu/side-menu";
import {
  fetchCategories,
  fetchCookiesUser,
  fetchData,
  fetchDmList,
} from "../actions/actions";

import React from "react";
import { cookies } from "next/headers";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  // JWT쿠키 정보를 가져와서 user 정보를 가져온다.
  const { user, dmList, categories } = await fetchData();

  return (
    <div className="flex h-full flex-col">
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
