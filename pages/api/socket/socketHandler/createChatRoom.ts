import { Socket } from "socket.io";

export const createChatRoomHandler = (socket: Socket) => {
  socket.on("createChatRoom", ({ chatId }: { chatId: string }) => {
    socket.join(`chatRoom:${chatId}`);

    console.log(`Created chatRoom for ${chatId}`);
  });
};
