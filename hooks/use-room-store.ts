import { CategoriesType } from "@/types";
import { create } from "zustand";

type RoomStoreType = {
  selected: CategoriesType | null;
  setSelected: (category: CategoriesType) => void;
  selectedChat: { chat_id: number; room_name: string; active_users: number };
  setSelectedChat: (chat: {
    chat_id: number;
    room_name: string;
    active_users: number;
  }) => void;
};

export const useRoomStore = create<RoomStoreType>((set) => ({
  selected: null,
  setSelected: (category) => set({ selected: category }),
  selectedChat: { chat_id: 0, room_name: "no name", active_users: 0 },
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
