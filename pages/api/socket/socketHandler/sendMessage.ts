import { Socket } from "socket.io";
import { AWS_S3, AWS_BUCKET } from "@/lib/aws-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { sendMessageAndGetMessages } from "@/lib/service/service";
import { dateName } from "@/util/utils";

export const sendMessageHandler = (socket: Socket, io: any) => {
  socket.on("sendMessage", async (data, callback) => {
    let { userId, chatId, message, photo, startTime, photoName } = data;
    let type;
    try {
      if (photo) {
        const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 data");
        }
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const photoDateName = dateName({ name: photoName });

        await AWS_S3.send(
          new PutObjectCommand({
            Bucket: `${AWS_BUCKET}`,
            Key: `messages/${photoDateName}`,
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

      const result = await sendMessageAndGetMessages({
        userId,
        chatId,
        message,
        type,
      });

      // socket으로 메세지가 비동기로 빠르게 전송이될때 메세지가 중복으로 전송되는 현상을 막기위해 추가
      const newResult = { ...result, content: message };

      io.to(`chatRoom:${chatId}`).emit("messages", {
        chatId: +chatId,
        messages: newResult,
        messages_type: type,
        startTime,
      });
      callback && callback({ success: true });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });
};
