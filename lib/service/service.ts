import { CategoriesType, messagesType } from "@/types";
import { executeQuery } from "../database/db";
import {
  CHECK_USER_EXISTS,
  CREATE_CATEGORY,
  CREATE_CHAT_ROOM,
  CREATE_USER,
  DELETE_CHAT_ROOM,
  DELETE_DM_CHAT_ROOM,
  DELETE_DM_MESSAGES,
  DELETE_MESSAGES,
  DELETE_ROOM_MEMBERS,
  DELETE_TEXT_MESSAGE,
  GET_CATEGORY,
  GET_CATEGORY_ROOMS,
  GET_DIRECT_MESSAGE_AFTER,
  GET_MESSAGE_AFTER,
  GET_USER_CONNECTED_DM,
  GET_USER_CONNECTED_ROOMS,
  GET_USER_ROLE,
  IS_USER_CONNECTED,
  IS_USER_CONNECTED_DM,
  JOIN_DIRECT_ROOMS,
  JOIN_ROOM,
  LEAVE_DM,
  LEAVE_ROOM,
  LOGIN_USER,
  SENT_MESSAGE,
  USER_ENTERED_ROOM,
} from "../query/queries";
import { ResultSetHeader } from "mysql2";

export const createUser = async (
  id: string,
  userName: string,
  password: string,
) => {
  try {
    const result = await executeQuery(CREATE_USER, [id, userName, password]);
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const [result] = (await executeQuery(CHECK_USER_EXISTS, [userId])) as {
      count: number;
    }[];
    return result.count > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error; // 에러를 상위로 전파하여 호출자가 처리할 수 있게 함
  }
};

export const loginUser = async (id: string, password: string) => {
  try {
    const res = await executeQuery(LOGIN_USER, [id, password]);
    return res;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export async function getCategoryRooms() {
  const result = await executeQuery(GET_CATEGORY_ROOMS);
  return result;
}

export const createChatRoom = async (
  categoryName: string,
  roomName: string,
  userId: number,
) => {
  try {
    // 1. 카테고리 조회
    const categories = (await executeQuery(GET_CATEGORY, [
      categoryName,
    ])) as CategoriesType[];

    let categoryId: number;

    if (categories?.length === 0) {
      // 카테고리가 존재하지 않으면 새로 생성
      const result = (await executeQuery(CREATE_CATEGORY, [
        categoryName,
      ])) as ResultSetHeader;
      categoryId = result?.insertId;
    } else {
      // 기존 카테고리 사용
      categoryId = categories[0].category_id;
    }
    // 2.채팅방 생성
    const roomResult = (await executeQuery(CREATE_CHAT_ROOM, [
      categoryId,
      roomName,
      userId,
    ])) as ResultSetHeader;

    if (roomResult?.affectedRows === 0) {
      throw new Error("채팅방 생성에 실패했습니다.");
    }

    // 3. 생성된 채팅방 정보 반환
    // return {
    //   chat_id: roomResult.insertId,
    //   room_name: roomName,
    //   category_id: categoryId,
    // } as ChatRoom;

    // 업데이트된 카테고리 정보 반환
    const data = await executeQuery(GET_CATEGORY_ROOMS);
    return data;
  } catch (error) {
    console.error("채팅방 생성 중 오류 발생:", error);
    throw error;
  }
};

export const getMessages = async (chatId: number, userId: number) => {
  try {
    let res;
    res = (await executeQuery(GET_MESSAGE_AFTER, [
      userId,
      chatId,
    ])) as messagesType[];
    return res;
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
};

export const sendMessageAndGetMessages = async ({
  userId = null,
  chatId,
  message,
  init = false,
  type = "message",
}: {
  userId?: number | null;
  chatId: number;
  message: string;
  init?: boolean;
  type?: string;
}) => {
  try {
    // const res = await executeQuery(SENT_MESSAGE, [userId, chatId, message]);

    // 첫 입장과, 퇴장시에 시스템 메세지를 보내고, 그 이외에는 일반 메세지를 보내는 로직
    // 아니면 첫입장시에만 전체메세지를 불러오고, 그 이후에는 새로운 메세지만 불러오는 로직
    let result;
    // let response;
    // if (type == "system") {
    //   await executeQuery(SYSTEM_MESSAGE, [chatId, message]);
    // }
    // if (type == "direct") {
    //   await executeQuery(SENT_MESSAGE, [userId, chatId, message]);
    // } else {
    //   await executeQuery(SENT_MESSAGE, [userId, chatId, message]);
    // }
    const resSentMessage = (await executeQuery(SENT_MESSAGE, [
      userId,
      chatId,
      message,
      type,
    ])) as ResultSetHeader;

    if (resSentMessage?.affectedRows === 0) return null;

    if (type == "direct") {
      console.log("sival");
      result = (await executeQuery(GET_DIRECT_MESSAGE_AFTER, [
        chatId,
        userId,
        chatId,
        userId,
      ])) as messagesType[];
    } else {
      result = (await executeQuery(GET_MESSAGE_AFTER, [
        userId,
        chatId,
      ])) as messagesType[];
    }

    if (!init) {
      // 입력 메세지와, 시스템메세지을떄 마지막 메세지만 반환
      const lastMessage = result[result?.length - 1];
      result = lastMessage;
    }

    return result;
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
};

// 방 입장 쿼리
export const joinRoom = async (userId: number, chatId: number) => {
  try {
    await executeQuery(JOIN_ROOM, [chatId, userId]);
  } catch (error) {
    console.error("방 입장 중 오류 발생:", error);
    throw error;
  }
};

// 현재 채팅방에 참여중인 멤버 조회
export const getRoomMembers = async (chatId: number) => {
  try {
    const members = await executeQuery(USER_ENTERED_ROOM, [chatId]);
    return members;
  } catch (error) {
    console.error("방 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 사용자 참여중인 방 목록 조회
export const enteredRoomList = async (userId: number) => {
  try {
    const members = await executeQuery(GET_USER_CONNECTED_ROOMS, [userId]);
    return members;
  } catch (error) {
    console.error("방 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 사용자 권한 조회
export const getUserRole = async (userId: number) => {
  const user = await executeQuery(GET_USER_ROLE, [userId]);
  if (!user) throw new Error("User not found");
  return user;
};

// 방 나가기
export const leaveRoom = async (
  userId: number,
  chatId: number,
): Promise<boolean> => {
  try {
    const res = (await executeQuery(LEAVE_ROOM, [
      chatId,
      userId,
    ])) as ResultSetHeader;

    return res?.affectedRows > 0;
  } catch (error) {
    console.error("방 나가기 중 오류 발생:", error);
    throw error;
  }
};

export const isUserInRoom = async (
  userId: number,
  chatId: number,
): Promise<boolean> => {
  const result = await executeQuery(IS_USER_CONNECTED, [chatId, userId]);
  const isUserInRoom = result as { count: number }[];
  return isUserInRoom[0]?.count > 0 ? true : false;
};

export const deleteChatRoom = async (chatId: string) => {
  await executeQuery(DELETE_MESSAGES, [chatId]);
  await executeQuery(DELETE_ROOM_MEMBERS, [chatId]);
  await executeQuery(DELETE_CHAT_ROOM, [chatId]);
};

// export const getIsAdmin = async (userId: number) => {
//   const role = await getUserRole(userId);
//   const result = role === UserRole.Admin;
//   return result;
// };

export const deleteMessageAndGetMessages = async (
  userId: number,
  chatId: number,
  messageId: number,
) => {
  await executeQuery(DELETE_TEXT_MESSAGE, [messageId]);
  const result = (await executeQuery(GET_MESSAGE_AFTER, [
    userId,
    chatId,
  ])) as messagesType[];
  return result;
};

export const getDirectMessages = async (chatId: number, userId: number) => {
  try {
    const res = await executeQuery(GET_DIRECT_MESSAGE_AFTER, [
      chatId,
      userId,
      chatId,
      userId,
    ]);
    const data = res as messagesType[];
    return data;
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
};

// DM방 입장 쿼리
export const directMessagesJoinRoom = async (
  userId: number,
  chatId: number,
) => {
  // 둘중에 작은 숫자
  const smaller = userId > chatId ? chatId : userId;
  // 둘중에 큰 숫자
  const bigger = userId > chatId ? userId : chatId;
  try {
    await executeQuery(JOIN_DIRECT_ROOMS, [smaller, bigger]);
  } catch (error) {
    console.error("방 입장 중 오류 발생:", error);
    throw error;
  }
};

// DM목록 조회
export const enteredDMList = async (userId: number) => {
  // 둘중에 작은 숫자
  try {
    const dmLists = await executeQuery(GET_USER_CONNECTED_DM, [
      userId,
      userId,
      userId,
      userId,
      userId,
    ]);
    return dmLists;
  } catch (error) {
    console.error("방 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

export const isUserDMRoom = async (
  userId: number,
  chatId: number,
): Promise<boolean> => {
  const result = await executeQuery(IS_USER_CONNECTED_DM, [
    userId,
    chatId,
    userId,
    chatId,
  ]);
  const isUserInRoom = result as { count: number }[];
  return isUserInRoom[0]?.count > 0 ? true : false;
};

// 방 나가기
export const leaveDM = async (
  userId: number,
  chatId: number,
): Promise<boolean> => {
  try {
    const res = (await executeQuery(LEAVE_DM, [
      chatId,
      userId,
      chatId,
      userId,
    ])) as ResultSetHeader;
    console.log("res: ", res);

    return res?.affectedRows > 0;
  } catch (error) {
    console.error("방 나가기 중 오류 발생:", error);
    throw error;
  }
};

export const deleteDMRoom = async (chatId: string, userId: number) => {
  await executeQuery(DELETE_DM_MESSAGES, [chatId]);
  await executeQuery(DELETE_DM_CHAT_ROOM, [chatId, userId, chatId, userId]);
};
