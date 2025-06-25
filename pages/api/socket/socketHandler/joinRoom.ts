import { enteredRoomList } from "@/lib/service/service";
import { Socket } from "socket.io";

export const joinRoomHandler = (socket: Socket, io: any) => {
  socket.on("joinRoom", async ({ userId }: { userId: string }) => {
    socket.join(`userRoom:${userId}`);
    console.log(`${userId} joined userRoom`);

    // 방문한 방의 목록
    // const userEnteredRoomList = await enteredRoomList(+userId);
    // io.to(`userRoom:${userId}`).emit("joinRoomList", userEnteredRoomList);
  });
};
