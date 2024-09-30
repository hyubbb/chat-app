import { Socket } from "socket.io";
import { joinRoomHandler } from "./joinRoom";
import { createChatRoomHandler } from "./createChatRoom";
import { sendMessageHandler } from "./sendMessage";

export const socketHandlers = (socket: Socket, io: any) => {
  joinRoomHandler(socket);
  createChatRoomHandler(socket);
  sendMessageHandler(socket, io);
};
