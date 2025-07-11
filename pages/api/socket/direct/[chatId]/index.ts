import {
  deleteChatRoom,
  directMessagesJoinRoom,
  enteredDMList,
  getCategoryRooms,
  getDirectMessages,
  isUserDMRoom,
  leaveDM,
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
    const { chatId: userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const result = await enteredDMList(+userId);
    res.status(200).json({ result, success: true });
  }

  // DM 채팅방 참여, 초기 메세지 불러오기
  if (req.method === "POST") {
    try {
      const chatId = parseInt(req.query.chatId as string, 10);
      const userId = parseInt(req.body.userId, 10);
      const { userName } = req.body;

      let result;
      let MESSAGE_TYPE;

      if (isNaN(chatId) || isNaN(userId) || !userName) {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
      const DM_ROOM_ID = createDMRoomId(chatId, userId);
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

      result = await getDirectMessages(DM_ROOM_ID, userId);
      MESSAGE_TYPE = "direct";

      const userEnteredRoomList = await enteredDMList(userId);
      const otherUserEnteredRoomList = await enteredDMList(chatId);

      // 첫 메세지 불러오기
      io.to(`dm_${DM_ROOM_ID}:${userId}`).emit("directMessages", {
        roomId: DM_ROOM_ID,
        messages: result,
        messages_type: MESSAGE_TYPE,
      });

      // 사용자의 DM 방 목록 업데이트
      io.to(`userRoom:${userId}`).emit("joinDmList", userEnteredRoomList);

      // 상대방에게도 DM 방 목록을 업데이트해 줍니다.
      io.to(`userRoom:${chatId}`).emit("joinDmList", otherUserEnteredRoomList);
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
    const { userId, userName, roomId, otherUserLeave } = req.body;

    console.log("=== DM 방 나가기 디버깅 ===");
    console.log("userId:", userId);
    console.log("chatId:", chatId);
    console.log("roomId:", roomId);
    console.log("otherUserLeave:", otherUserLeave, typeof otherUserLeave);

    if (!userId || !chatId || !userName || !roomId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const message = `${userName}님이 나가셨습니다.`;
    const resultMessage = await sendDMAndGetDM({
      userId: +userId,
      roomId: roomId,
      message,
      type: "system",
    });

    const io = res?.socket?.server?.io;
    if (!io) {
      return res
        .status(500)
        .json({ error: "Socket.IO server not initialized" });
    }

    // 채팅방 나가기
    const isSuccess = await leaveDM(userId, roomId, otherUserLeave);
    console.log("leaveDM 성공:", isSuccess);

    if (isSuccess) {
      // 나간 사용자의 dmList 업데이트
      const userEnteredRoomList = await enteredDMList(userId);
      console.log(
        "나간 사용자의 새로운 dmList:",
        userEnteredRoomList.length,
        "개",
      );

      // 상대방(남은 사용자)에게도 dmList 업데이트 알림
      const otherUserId = +chatId;
      const otherUserEnteredRoomList = await enteredDMList(otherUserId);
      console.log(
        "상대방의 새로운 dmList:",
        otherUserEnteredRoomList.length,
        "개",
      );
      console.log(
        "상대방 dmList 첫번째 항목의 other_user_leave:",
        otherUserEnteredRoomList[0]?.other_user_leave,
      );

      io.to(`dm_${roomId}`).emit("directMessages", {
        roomId,
        messages: resultMessage,
        messages_type: "system",
      });

      io.to(`userRoom:${userId}`).emit("joinDmList", userEnteredRoomList);
      io.to(`userRoom:${userId}`).emit("leaveDm", roomId);

      io.to(`userRoom:${otherUserId}`).emit(
        "joinDmList",
        otherUserEnteredRoomList,
      );

      // 추가: 더 확실한 업데이트를 위해 refreshDmList 이벤트도 전송
      io.to(`userRoom:${otherUserId}`).emit("refreshDmList");

      res.status(200).json({ result: userEnteredRoomList, success: true });
    } else {
      res.status(400).json({ success: false });
    }
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
