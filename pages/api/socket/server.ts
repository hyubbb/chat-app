import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { dateName } from "@/util/utils";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  enteredDMList,
  sendMessageAndGetMessages,
} from "@/lib/service/service";

const ServerHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io");
    const path = "/api/socket/server";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("서버 connection");

      // 유저별 socket.room 설정
      socket.on("joinRoom", ({ userId }: { userId: string }) => {
        socket.join(`userRoom:${userId}`);
      });

      // 채팅방 socket.room 설정
      socket.on("createChatRoom", ({ chatId }: { chatId: string }) => {
        socket.join(`chatRoom:${chatId}`);
      });

      // DM방과 DM방의 유저별 socket.room 설정
      socket.on(
        "directMessage",
        ({ roomId, userId }: { roomId: string; userId: number }) => {
          socket.join(`dm_${roomId}:${userId}`);
          socket.join(`dm_${roomId}`);
        },
      );

      // Socket 통신으로 메시지를 전송하고 받는 부분
      // api-socket 통신과 비교하기 위해서 추가한 코드
      socket.on("sendMessage", async (data, callback) => {
        let { userId, chatId, message, photo, startTime, photoName } = data;
        let type;
        try {
          if (photo) {
            // base64 데이터에서 실제 이미지 데이터 추출
            const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
              throw new Error("Invalid base64 data");
            }
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            const photoDateName = dateName({ name: photoName });

            // AWS S3에 이미지 업로드
            await AWS_S3.send(
              new PutObjectCommand({
                Bucket: `${AWS_BUCKET}`,
                Key: `messages/${photoDateName}`, // 저장시 넣고 싶은 파일 이름
                Body: buffer,
                ContentType: contentType,
              }),
            );
            const photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/messages/${photoDateName}`;
            type = "image";
            message = photoUrl;
          } else {
            type = "message";
          }

          // 메시지를 전송하고 필요한 응답을 수신

          const result = await sendMessageAndGetMessages({
            userId,
            chatId,
            message,
            type,
          });

          // 메시지를 채팅방에 방송
          callback && callback({ success: true });
          io.to(`chatRoom:${chatId}`).emit("messages", {
            chatId: +chatId,
            messages: result,
            messages_type: type,
            startTime,
          });
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("서버 disconnected");
      });
    });
  } else {
    console.log("Socketio is already set up");
  }

  res.end();
};

export default ServerHandler;
