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

export type RoomsType = {
  chat_id: number;
  room_name: string;
  active_users: number;
};

export type CategoriesType = {
  category_id: number;
  category_name: string;
  rooms: RoomsType[];
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
