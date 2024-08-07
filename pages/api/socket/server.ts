import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { dateName } from "@/util/utils";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { sendMessageAndGetMessages } from "@/lib/service/service";

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

      socket.on("joinRoom", ({ chatId }: { chatId: string }) => {
        socket.join(`chatRoom:${chatId}`);
      });

      socket.on("joinRoomList", ({ userId }: { userId: string }) => {
        socket.join(`userRoom:${userId}`);
      });

      socket.on(
        "directMessage",
        ({ dmName, userId }: { dmName: string; userId: number }) => {
          socket.join(`dm_${dmName}:${userId}`);
          socket.join(`dm_${dmName}`);
        },
      );

      socket.on("sendMessage", async (data, callback) => {
        const {
          userId,
          chatId,
          message: messages,
          photo,
          startTime,
          photoName,
        } = data;
        let type;
        let message = messages;
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
          // socket.to(`chatRoom:${chatId}`).emit("receiveMessage", result);
          callback && callback({ success: true });

          io.to(`chatRoom:${chatId}`).emit("receiveMessage", {
            chatId: +chatId,
            messages: result,
            messages_type: type,
            startTime,
          });
        } catch (error) {
          console.error("Error processing message:", error);
        }

        // socket.to(`chatRoom:${chatId}`).emit("receiveMessage", message);
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
