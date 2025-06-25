import { Socket } from "socket.io";
import { joinRoomHandler } from "./joinRoom";
import { createChatRoomHandler } from "./createChatRoom";
import { sendMessageHandler } from "./sendMessage";
import { createDMRoomHandler } from "./createDMRoom";
import { videoHandler } from "./videoHandler";

export const socketHandlers = (socket: Socket, io: any) => {
  joinRoomHandler(socket, io);
  // createChatRoomHandler(socket);
  createDMRoomHandler(socket);
  sendMessageHandler(socket, io);
  videoHandler(socket, io);
};
