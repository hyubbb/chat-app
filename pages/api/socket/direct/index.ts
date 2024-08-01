import {
  deleteMessageAndGetMessages,
  sendMessageAndGetMessages,
} from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { createDMRoomId } from "@/util/utils";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "POST") {
    // 메세지 전송 처리
    try {
      const { userId, chatId, message } = req.body;
      console.log(req.body);
      const result = await sendMessageAndGetMessages({
        userId,
        chatId,
        message,
        type: "direct",
      });

      console.log("result: ", result);

      const dmRoomId = createDMRoomId(chatId, userId);
      res?.socket?.server?.io?.to(`dm_${dmRoomId}`).emit("getDirectMessages", {
        chatId: +chatId,
        messages: result,
        messages_type: "direct",
      });
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PATCH") {
    // 메세지 전송 처리
    try {
      const { userId, chatId, messageId } = req.body;
      const result = await deleteMessageAndGetMessages(
        userId,
        chatId,
        messageId,
      );
      res?.socket?.server?.io?.to(`chatRoom:${chatId}`).emit("messages", {
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
