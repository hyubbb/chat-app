import { Socket } from "socket.io";

export const videoHandler = (socket: Socket, io: any) => {
  socket.on("offer", (offer) => {
    console.log("영상 걸다", offer);
    const { roomId, userId, userName, sdp } = offer;
    socket.to(`dm_${roomId}:${userId}`).emit("offer", { sdp, userName });
  });

  socket.on("answer", (answer) => {
    console.log("영상 받다");
    socket
      .to(`dm_${answer.room_id}:${answer.other_user_id}`)
      .emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    console.log("영상 중간 전달");
    socket.to(`dm_${candidate.chatId}`).emit("ice-candidate", candidate);
  });

  socket.on("call-rejected", (data) => {
    console.log("영상 거절");
    socket.to(`dm_${data.chatId}`).emit("call-rejected", {
      userName: data.userName,
      reason: data.reason,
    });
  });

  socket.on("call-ended", (data) => {
    console.log("영상 종료");
    socket.to(`dm_${data.chatId}`).emit("call-ended", {
      userName: data.userName,
    });
  });

  // socket.on("offer", ({ sdp, chatId }) => {
  //   console.log("[SERVER] offer", chatId);
  //   socket.to(`dm_${chatId}`).emit("offer", { sdp });
  // });

  // socket.on("answer", ({ sdp, chatId }) => {
  //   console.log("[SERVER] answer", chatId);
  //   socket.to(`dm_${chatId}`).emit("answer", { sdp });
  // });

  // socket.on("ice-candidate", ({ candidate, chatId }) => {
  //   socket.to(`dm_${chatId}`).emit("ice-candidate", { candidate });
  // });
};
