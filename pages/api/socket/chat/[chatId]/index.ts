import {
  deleteChatRoom,
  enteredRoomList,
  getCategoryRooms,
  getMessages,
  getRoomMembers,
  isUserInRoom,
  joinRoom,
  leaveRoom,
  sendMessageAndGetMessages,
} from "@/lib/service/service";
import { messagesType, NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  // 채팅방 멤버 조회
  if (req.method === "GET") {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const result = await getRoomMembers(+chatId);
    res.status(200).json({ result, success: true });
  }
  // 채팅방에 참여, 초기 메세지 불러오기
  if (req.method === "POST") {
    try {
      const chatId = parseInt(req.query.chatId as string, 10);
      const userId = parseInt(req.body.userId, 10);
      const cursor = req.body.cursor;
      const MESSAGES_PER_PAGE = 20;
      const { userName, direct } = req.body;
      let result: messagesType[] | messagesType;
      let ROOM_TYPE;
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

      const isEntered = await isUserInRoom(userId, chatId);
      if (isEntered) {
        result = await getMessages(chatId, userId, cursor, MESSAGES_PER_PAGE);
        ROOM_TYPE = `userRoom:${userId}`;
      } else {
        await joinRoom(userId, chatId);
        MESSAGE_TYPE = "system";
        result = await sendMessageAndGetMessages({
          userId,
          chatId,
          message: `${userName}님이 채팅방에 참여했습니다.`,
          init: true,
          type: MESSAGE_TYPE,
          cursor,
        });
        ROOM_TYPE = `chatRoom:${chatId}`;
      }

      if (Array.isArray(result)) {
        result = result;
      } else {
        result = [result];
      }
      let newCursor = undefined;
      if (result.length >= 20) {
        newCursor = result[result.length - 1]?.message_id;
      }

      io.to(ROOM_TYPE).emit("messages", {
        chatId,
        messages: result,
        nextCursor: newCursor,
        messages_type: MESSAGE_TYPE,
      });
      // 방문한 방의 목록
      const userEnteredRoomList = await enteredRoomList(userId);
      io.to(`userRoom:${userId}`).emit("joinRoomList", userEnteredRoomList);
      res.status(200).json({
        success: true,
        data: {
          messages: result,
          messages_type: MESSAGE_TYPE,
          nextCursor: result && newCursor,
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

  // 채팅방 나가기
  if (req.method === "PATCH") {
    const { chatId } = req.query;
    const { userId, userName, cursor } = req.body;
    if (!userId || !chatId || !userName) {
      return res.status(400).json({ error: "Invalid request" });
    }
    // 채팅방 나가기 시스템 메세지 전송 및 메세지 불러오기
    let MESSAGE_TYPE = "system";
    const message = `${userName}님이 나가셨습니다.`;
    const resultMessage = await sendMessageAndGetMessages({
      userId: +userId,
      chatId: +chatId,
      message,
      type: MESSAGE_TYPE,
      cursor,
    });

    const io = res?.socket?.server?.io;
    if (!io) {
      return res
        .status(500)
        .json({ error: "Socket.IO server not initialized" });
    }

    // 채팅방 나가기
    const isSuccess = await leaveRoom(+userId, +chatId);
    if (isSuccess) {
      // 참여중인 채팅방 목록 조회
      const result = await enteredRoomList(+userId);

      io.to(`chatRoom:${chatId}`).emit("messages", {
        chatId: +chatId,
        messages: resultMessage,
        messages_type: MESSAGE_TYPE,
      });
      io.to(`userRoom:${userId}`).emit("leaveRoom", {
        chatId: +chatId,
        userId: +userId,
      });

      io.to(`${chatId}`).emit("messages", { chatId });
      io.to(`${userId}`).emit("leaveRoom", { chatId });

      io.to(`chatRoom:${chatId}`).emit("messages", { chatId });
      io.to(`userRoom:${userId}`).emit("leaveRoom", { chatId });

      io.to(`userRoom:${userId}`).emit("joinRoomList", result);
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
