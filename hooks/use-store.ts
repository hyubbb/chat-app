import { create } from "zustand";

type SocketStoreType = {
  socket: any;
  isConnected: boolean;
  setSocket: ({
    socket,
    isConnected,
  }: {
    socket: any;
    isConnected: boolean;
  }) => void;
  user: any;
  getUser: (user: any) => void;
};

export const useSocketStore = create<SocketStoreType>((set) => ({
  socket: null,
  isConnected: false,
  user: { user_id: 1, user_name: "admin" },
  getUser: (user) => set({ user }),
  setSocket: ({ socket, isConnected }) => set({ socket, isConnected }),
}));
