"use client";

import { useSocketStore } from "@/hooks/use-store";
import { ErrorProps } from "next/error";
import { useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { setSocket } = useSocketStore();

  useEffect(() => {
    const socketInstance = new (ClientIO as any)("http://localhost:3000", {
      path: "/api/socket/server",
      // autoConnect: false,
    });

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

    setSocket({ socket: socketInstance, isConnected });

    return () => {
      socketInstance?.disconnect();
    };
  }, []);

  return <>{children}</>;
};
