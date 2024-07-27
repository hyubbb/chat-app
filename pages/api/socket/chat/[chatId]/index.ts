import { enteredRoomList, getRoomMembers, leaveRoom } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  const { chatId, userId } = req.query;
  if(req.method === "GET") {
    if (!chatId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const result = await getRoomMembers(+chatId);
    console.log("sibal",result)
    // res?.socket?.server?.io?.emit("joinRoomList", result);
    res.status(200).json({result, success: true});
  }

  if (req.method === "DELETE") {
    if (!userId || !chatId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    // 채팅방 나가기
    await leaveRoom(+userId, +chatId);
    // 참여중인 채팅방 목록 조회
    const result = await enteredRoomList(+userId);
    res?.socket?.server?.io?.emit("joinRoomList", result);
    res.status(200).json({result, success: true});
  }
}
