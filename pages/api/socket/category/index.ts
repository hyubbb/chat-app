import { createChatRoom, getCategoryRooms } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "GET") {
    // 카테고리 목록 조회
    const categoryList = await getCategoryRooms();
    res?.socket?.server?.io?.emit("categoryList", categoryList);
    res.status(200).json(categoryList);
  }

  if (req.method === "POST") {
    try {
      // 채팅방 생성
      const { categoryName, roomName } = req.body;
      const result = await createChatRoom(categoryName, roomName);
      res?.socket?.server?.io?.emit("categoryList", result);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
