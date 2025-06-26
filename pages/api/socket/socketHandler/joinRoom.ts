import { enteredRoomList } from "@/lib/service/service";
import { Socket } from "socket.io";

export const joinRoomHandler = (socket: Socket, io: any) => {
  socket.on("joinRoom", async ({ userId }: { userId: string }) => {
    socket.join(`userRoom:${userId}`);
    console.log(`✅ ${userId} joined userRoom - Socket ID: ${socket.id}`);

    // userRoom에 몇 명이 연결되어 있는지 확인
    const socketsInRoom = await io.in(`userRoom:${userId}`).fetchSockets();
    console.log(
      `🔍 userRoom:${userId}에 연결된 소켓 수:`,
      socketsInRoom.length,
    );

    // 방문한 방의 목록
    // const userEnteredRoomList = await enteredRoomList(+userId);
    // io.to(`userRoom:${userId}`).emit("joinRoomList", userEnteredRoomList);
  });
};
