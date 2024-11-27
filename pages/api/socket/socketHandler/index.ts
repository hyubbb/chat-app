import { Socket } from "socket.io";
import { joinRoomHandler } from "./joinRoom";
import { createChatRoomHandler } from "./createChatRoom";
import { sendMessageHandler } from "./sendMessage";
import { createDMRoomHandler } from "./createDMRoom";

export const socketHandlers = (socket: Socket, io: any) => {
  joinRoomHandler(socket);
  createChatRoomHandler(socket);
  createDMRoomHandler(socket);
  sendMessageHandler(socket, io);
};
