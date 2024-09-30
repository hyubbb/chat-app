import { Socket } from "socket.io";

export const joinRoomHandler = (socket: Socket) => {
  socket.on("joinRoom", ({ userId }: { userId: string }) => {
    socket.join(`userRoom:${userId}`);
    console.log(`${userId} joined userRoom`);
  });
};
