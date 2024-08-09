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
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (isOpen: boolean) => void;
};

export const useStore = create<SocketStoreType>((set) => ({
  socket: null,
  isConnected: false,
  setSocket: (socket) => set({ socket: socket, isConnected: true }),
  isLoginModalOpen: false,
  setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  isSignUpModalOpen: false,
  setIsSignUpModalOpen: (isOpen) => set({ isSignUpModalOpen: isOpen }),
  isEditModalOpen: false,
  setIsEditModalOpen: (isOpen) => set({ isEditModalOpen: isOpen }),
  isUploadModalOpen: false,
  setIsUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),
  isMenuModalOpen: false,
  setIsMenuModalOpen: (isOpen) => set({ isMenuModalOpen: isOpen }),
}));
