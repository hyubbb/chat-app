import { HeaderMenu } from "@/components/menu/header-menu";
import { SideMenu } from "@/components/menu/side-menu";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col">
      <HeaderMenu />
      <div className="flex h-[calc(100vh-70px)] overflow-hidden">
        <SideMenu />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
