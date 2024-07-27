import {
  enteredRoomList,
  joinRoom,
  sendSystemMessageAndGetMessages,
} from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "GET") {
    //  사용자가 참여중인 방 목록 조회
    // const userEnteredRoomList = await enteredRoomList();
  }

  if (req.method === "POST") {
    try {
      const { chatId } = req.query;
      const { userName, userId } = req.body;
      if (
        chatId === undefined ||
        userName === undefined ||
        userId === undefined
      ) {
        return res.status(400).json({ error: "Invalid request" });
      }

      // 채팅방 참여
      await joinRoom(+userId, +chatId);

      //  해당방에 접속중인 유저목록 조회 이건 나중에 join해서 방정보 한거번에 가져오는걸로 변경
      // const enteredRoomList = await getRoomMembers(+userId);

      //  사용자가 참여중인 방 목록 조회
      const userEnteredRoomList = await enteredRoomList(+userId);

      // 채팅방참여 시스템 메세지 전송 및 메세지 불러오기
      const message = `${userName}님이 채팅방에 참여했습니다.`;
      const result = await sendSystemMessageAndGetMessages(+chatId, message);

      res?.socket?.server?.io?.emit("messages", { chatId, messages: result });
      res?.socket?.server?.io?.emit("joinRoomList", userEnteredRoomList);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
