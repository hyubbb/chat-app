import { Socket } from "socket.io";

export const createDMRoomHandler = (socket: Socket) => {
  socket.on(
    "createDMRoom",
    ({ chatId, userId }: { chatId: string; userId: string }) => {
      socket.join(`dm_${chatId}:${userId}`);
      socket.join(`dm_${chatId}`);
      console.log(`Created dmRoom for ${chatId}, userId: ${userId}`);
    },
  );
};
