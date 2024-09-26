import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import {
  deleteMessageAndGetMessages,
  sendMessageAndGetMessages,
} from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { dateName } from "@/util/utils";
import {
  ChecksumAlgorithm,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { NextApiRequest } from "next";
import { IncomingForm, Fields, Files } from "formidable";
export const config = {
  api: {
    bodyParser: false,
  },
};
const parseFormData = async (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> => {
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const parseJsonData = async (req: NextApiRequest): Promise<any> => {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(JSON.parse(data));
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  // 메세지 전송, 이미지 업로드 처리
  if (req.method === "POST") {
    // 메세지 전송 처리
    let userId, chatId, message, type;

    try {
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("multipart/form-data")) {
        const { fields, files } = await parseFormData(req);

        // 필드 데이터 처리
        const [f_userId] = fields.userId as string[];
        const [f_chatId] = fields.chatId as string[];
        const [photoData] = fields.photo as string[];
        const [photoDataName] = fields.photoName as string[];
        // base64 데이터에서 실제 이미지 데이터 추출
        const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 data");
        }
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const photoName = dateName({ name: photoDataName });

        await AWS_S3.send(
          new PutObjectCommand({
            Bucket: `${AWS_BUCKET}`,
            Key: `messages/${photoName}`, // 저장시 넣고 싶은 파일 이름
            Body: buffer,
            ContentType: contentType,
          }),
        );
        const photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/messages/${photoName}`;
        message = photoUrl;
        userId = f_userId;
        chatId = f_chatId;
        type = "image";
      } else {
        const body = await parseJsonData(req);
        userId = body.userId;
        chatId = body.chatId;
        message = body.message;
        type = "message";
      }

      const result = await sendMessageAndGetMessages({
        userId,
        chatId,
        message,
        type,
      });

      res?.socket?.server?.io?.to(`chatRoom:${chatId}`).emit("messages", {
        chatId: +chatId,
        messages: result,
        messages_type: "message",
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // 메세지 삭제 처리
  if (req.method === "PATCH") {
    // 메세지 전송 처리

    try {
      const body = await parseJsonData(req);
      const { userId, chatId, messageId, message_type, content } = body;
      const result = await deleteMessageAndGetMessages(
        userId,
        chatId,
        messageId,
      );

      if (message_type === "image") {
        const urlParts = content?.split("/");
        const fileName = urlParts?.[urlParts?.length - 1]; // 경로의 마지막 부분이 파일 이름
        AWS_S3.send(
          new DeleteObjectCommand({
            Bucket: `${AWS_BUCKET}`,
            Key: `messages/${fileName}`,
          }),
        );
      }
      res?.socket?.server?.io?.to(`chatRoom:${chatId}`).emit("deleteMessage", {
        chatId,
        messages: result,
        messages_type: "deleted",
      });
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
