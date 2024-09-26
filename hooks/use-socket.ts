// 방을 만들거나 떠날떄 목록볼때 사용하는 소켓 훅

"use client";
import { useEffect } from "react";
import { useStore } from "../store/use-store";
import { UserType } from "@/types";

type UseRoomSocketProps = {
  initUser: UserType | null;
};

export const useSocket = ({ initUser }: UseRoomSocketProps) => {
  const { socket, isConnected } = useStore();

  useEffect(() => {
    if (!socket || !initUser || !isConnected) return;
    socket.emit("joinRoom", { userId: initUser?.user_id });

    return () => {};
  }, [socket, initUser, isConnected]);
};
