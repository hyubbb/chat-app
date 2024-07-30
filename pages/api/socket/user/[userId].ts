import { enteredRoomList } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  const { userId } = req.query;

  if (req.method === "GET") {
    if (userId === undefined) {
      return res.status(400).json({ error: "Invalid request" });
    }
    //  사용자가 참여중인 방 목록 조회
    const result = await enteredRoomList(+userId);
    res?.socket?.server?.io?.to(userId).emit("joinRoomList", result);
    res.status(200).json(result);
  }
}
