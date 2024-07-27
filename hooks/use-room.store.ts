import { CategoriesType, RoomsType } from "@/types";
import { create } from "zustand";

type RoomStoreType = {
  selected: CategoriesType | null;
  setSelected: (category: CategoriesType) => void;
  selectedChat: RoomsType | null;
  setSelectedChat: (chat: RoomsType) => void;
};

export const useRoomStore = create<RoomStoreType>((set) => ({
  selected: null,
  setSelected: (category) => set({ selected: category }),
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
