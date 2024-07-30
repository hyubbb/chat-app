import { createChatRoom, getCategoryRooms } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Socket } from "socket.io";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "POST") {
    try {
      // 채팅방 생성
      const { categoryName, roomName, userId } = req.body;
      const result = await createChatRoom(categoryName, roomName, userId);
      res?.socket?.server?.io?.emit("categoryList", result);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
