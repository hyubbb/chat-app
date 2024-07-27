import { CategoriesType } from "@/types";
import { executeQuery } from "../database/db";
import {
  CREATE_CATEGORY,
  CREATE_CHAT_ROOM,
  GET_CATEGORY,
  GET_CATEGORY_ROOMS,
  GET_MESSAGE,
  GET_MESSAGE_AFTER,
  GET_USER_CONNECTED_ROOMS,
  GET_USER_ROLE,
  IS_USER_CONNECTED,
  JOIN_ROOM,
  LEAVE_ROOM,
  SENT_MESSAGE,
  SYSTEM_MESSAGE,
  USER_ENTERED_ROOM,
} from "../query/queries";

export async function getCategoryRooms() {
  const result = await executeQuery(GET_CATEGORY_ROOMS);
  return (result);
}

export const createChatRoom = async(categoryName: string, roomName: string)=> {
  try {
    // // 1. 카테고리 조회
    const categories = await executeQuery(GET_CATEGORY, [categoryName]);

    let categoryId: number;
    if (categories?.length === 0) {
      //   //   // 카테고리가 존재하지 않으면 새로 생성
      const result = await executeQuery(CREATE_CATEGORY, [categoryName]);
      categoryId = result.insertId;
    } else {
      //   // 기존 카테고리 사용
      categoryId = categories[0].category_id;
    }
    // // 2. 채팅방 생성
    const roomResult = await executeQuery(CREATE_CHAT_ROOM, [
      categoryId,
      roomName,
    ]);

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
    return Object.values(data);
  } catch (error) {
    console.error("채팅방 생성 중 오류 발생:", error);
    throw error;
  }
}

export const getMessages = async (chatId: string) => {
  try {
    const res = await executeQuery(GET_MESSAGE_AFTER, [chatId]);
    console.log(res)
    return res;
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
};

export const sendMessageAndGetMessages = async (
  userId: string,
  chatId: string,
  message: string,
) => {
  try {
    await executeQuery(SENT_MESSAGE, [userId, chatId, message]);

    const res = await executeQuery(GET_MESSAGE, [chatId]);

    return res;
  } catch (error) {
    console.error("메시지 전송 중 오류 발생:", error);
    throw error;
  }
};

export const sendSystemMessageAndGetMessages = async (
  chatId: number,
  message: string,
) => {
  try {
    await executeQuery(SYSTEM_MESSAGE, [chatId, message]);

    const res = await executeQuery(GET_MESSAGE, [chatId]);

    return res;
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
export const getRoomMembers = async (roomId: number) => {
  try {
    const members = await executeQuery(USER_ENTERED_ROOM, [roomId]);
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
export async function leaveRoom(userId: number, roomId: number): Promise<void> {
  try {
    await executeQuery(LEAVE_ROOM,[roomId, userId]);
  } catch (error) {
    console.error('방 나가기 중 오류 발생:', error);
    throw error;
  }
}

export async function isUserInRoom(userId: number, roomId: number) {
  const result = await executeQuery (IS_USER_CONNECTED,[roomId, userId]
  );
  return !!result;
}


// export const getIsAdmin = async (userId: number) => {
//   const role = await getUserRole(userId);
//   const result = role === UserRole.Admin;
//   return result;
// };
