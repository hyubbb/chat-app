import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type UserType = {
  user_id: number;
  id: number;
  user_name: string;
  photo_url: string;
  role: string;
};

export const defaultUser: UserType = {
  id: 0,
  user_id: 0,
  user_name: "",
  photo_url: "",
  role: "",
};

export type RoomsType = {
  chat_id: number;
  room_name: string;
  active_users: number;
  user_id: number;
};

export const defaultRooms: RoomsType = {
  chat_id: 0,
  room_name: "",
  active_users: 0,
};

export type CategoriesType = {
  category_id: number;
  category_name: string;
  rooms: RoomsType[];
};

export const defaultCategories: CategoriesType = {
  category_id: 0,
  category_name: "",
  rooms: [],
};

export type CollapseStateType = {
  dm: boolean;
  room: boolean;
  entered: boolean;
};

export type messagesType = {
  message_id: number;
  content: string;
  sent_at: string;
  user_id: number;
  user_name: string;
  chat_id: number;
  room_name: string;
  category_id: number;
  category_name: string;
  message_type: string;
};
