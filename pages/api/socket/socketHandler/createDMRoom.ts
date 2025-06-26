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

  // DM 방 입장 이벤트 처리
  socket.on(
    "directMessage",
    ({
      roomId,
      chatId,
      userId,
    }: {
      roomId: string;
      chatId: number;
      userId: number;
    }) => {
      socket.join(`dm_${roomId}:${userId}`);
      socket.join(`dm_${roomId}`);
      console.log(`User ${userId} joined DM room: ${roomId}`);
    },
  );
};
