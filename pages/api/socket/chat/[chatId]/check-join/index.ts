import { isUserInRoom } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

// pages/api/socket/chat/[chatId]/check-join.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "GET") {
    const { chatId } = req.query;
    const { userId } = req.body;

    const isEntered = await isUserInRoom(Number(userId), Number(chatId));
    return res.status(200).json(isEntered);
  }
}
