import {
  deleteChatRoom,
  directMessagesJoinRoom,
  enteredDMList,
  enteredRoomList,
  getCategoryRooms,
  getDirectMessages,
  isUserDMRoom,
  leaveDM,
  leaveRoom,
  sendDMAndGetDM,
} from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { createDMRoomId } from "@/util/utils";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  // DM 메세지 목록 가져오기
  if (req.method === "GET") {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const result = await enteredDMList(+chatId);
    res.status(200).json({ result, success: true });
  }

  // DM 채팅방 참여, 초기 메세지 불러오기
  if (req.method === "POST") {
    try {
      const chatId = parseInt(req.query.chatId as string, 10);
      const userId = parseInt(req.body.userId, 10);
      const { userName } = req.body;
      const DM_ROOM_NAME = createDMRoomId(chatId, userId);
      let result;
      let MESSAGE_TYPE;
      if (isNaN(chatId) || isNaN(userId) || !userName) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
      const io = res?.socket?.server?.io;
      if (!io) {
        return res
          .status(500)
          .json({ error: "Socket.IO server not initialized" });
      }

      const isEntered = await isUserDMRoom(userId, chatId);
      if (!isEntered) {
        await directMessagesJoinRoom(userId, chatId);
      }
      result = await getDirectMessages(chatId, userId);
      MESSAGE_TYPE = "direct";

      const userEnteredRoomList = await enteredDMList(userId);
      // 방문한 방의 목록
      io.to(`dm_${DM_ROOM_NAME}:${userId}`).emit("getDirectMessages", {
        chatId,
        messages: result,
        messages_type: MESSAGE_TYPE,
      });

      io.to(`userRoom:${userId}`).emit("joinDmList", userEnteredRoomList);

      res.status(200).json({
        success: true,
        data: {
          chatId,
          messages: result,
          messages_type: MESSAGE_TYPE,
        },
        message: "User joined the chat room successfully",
      });
    } catch (error) {
      console.error("Error in chat room joining process:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  // DM 채팅방 나가기
  if (req.method === "PATCH") {
    const { chatId } = req.query;
    const { userId, userName, exit_count } = req.body;
    if (!userId || !chatId || !userName || isNaN(exit_count)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    // 채팅방 나가기 시스템 메세지 전송 및 메세지 불러오기
    let MESSAGE_TYPE = "system";
    const message = `${userName}님이 나가셨습니다.`;
    const resultMessage = await sendDMAndGetDM({
      userId: +userId,
      chatId: +chatId,
      message,
      type: MESSAGE_TYPE,
    });
    const DM_ROOM_NAME = createDMRoomId(+chatId, userId);
    const io = res?.socket?.server?.io;
    if (!io) {
      return res
        .status(500)
        .json({ error: "Socket.IO server not initialized" });
    }

    // 채팅방 나가기
    const isSuccess = await leaveDM(+userId, +chatId);

    if (isSuccess) {
      // 참여중인 채팅방 목록 조회
      const result = await enteredDMList(+userId);

      io.to(`dm_${DM_ROOM_NAME}`).emit("messages", {
        chatId: +chatId,
        messages: resultMessage,
        messages_type: MESSAGE_TYPE,
      });

      const userEnteredRoomList = await enteredDMList(userId);
      io.to(`userRoom:${userId}`).emit("joinDmList", userEnteredRoomList);

      res.status(200).json({ result, success: true });
    }

    res.status(400).json({ success: false });
  }

  if (req.method === "DELETE") {
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    try {
      await deleteChatRoom(chatId as string);
      const result = await getCategoryRooms();
      res?.socket?.server?.io?.emit("categoryList", result);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
