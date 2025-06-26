import { getChatInfo, getRoomMembers } from "@/lib/service/service";
import { RoomsType } from "@/types";
import { useEffect } from "react";
import ChatRoom from "../_components/ChatRoom";

export const metadata = {
  title: "ROOM CHAT",
};

type ChatPageProps = {
  params: {
    chatId: number;
  };
};

const getChat = async (chatId: number) => {
  const [roomInfo] = (await getChatInfo(chatId)) as RoomsType[];
  return roomInfo;
};

const ChatPage = async ({ params }: ChatPageProps) => {
  const info = await getChat(params?.chatId);
  const enteredUsers = await getRoomMembers(params?.chatId);
  return (
    <ChatRoom
      chatId={+params.chatId}
      roomInfo={info}
      usersList={enteredUsers}
    />
  );
};
export default ChatPage;
