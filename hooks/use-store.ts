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
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  isSignUpModalOpen: boolean;
  setIsSignUpModalOpen: (isOpen: boolean) => void;
};

export const useStore = create<SocketStoreType>((set) => ({
  socket: null,
  isConnected: false,
  isLoginModalOpen: false,
  setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  setSocket: (socket) => set({ socket: socket, isConnected: true }),
  isSignUpModalOpen: false,
  setIsSignUpModalOpen: (isOpen) => set({ isSignUpModalOpen: isOpen }),
}));
