import { sendMessageAndGetMessages } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "GET") {
    // const categoryList = await getCategoryRooms();
    // res?.socket?.server?.io?.emit("categoryList", categoryList);
  }

  if (req.method === "POST") {
    try {
      const { userId, chatId, message } = req.body;

      const result = await sendMessageAndGetMessages(userId, chatId, message);
      res?.socket?.server?.io?.emit("messages", { chatId, messages: result });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
