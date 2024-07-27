import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-1 flex-col dark:bg-zinc-800">{children}</main>
  );
};

export default Layout;
