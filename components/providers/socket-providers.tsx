"use client";

import { useStore } from "@/store/use-store";
import { ErrorProps } from "next/error";
import { useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { setSocket } = useStore();

  useEffect(() => {
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL,
      {
        path: "/api/socket/server",
      },
    );

    socketInstance.on("connect", () => {
      console.log("[CONNECTED]");
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (err: ErrorProps) => {
      console.log(`connect_error due to ${err}`);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      console.log("[DISCONNECTED]");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance?.disconnect();
    };
  }, [setSocket]);

  return <>{children}</>;
};
