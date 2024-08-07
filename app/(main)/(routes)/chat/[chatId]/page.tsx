import { ChatRoom } from "@/components/chat/chat-room";
import {
  enteredRoomList,
  getCategoryRooms,
  getChatInfo,
} from "@/lib/service/service";
import { RoomsType } from "@/types";

export const metadata = {
  title: "Chat page",
};

type ChatPageProps = {
  params: {
    chatId: number;
  };
};

const getChat = async (chatId: number) => {
  // if (chatId === undefined) return;
  const [roomInfo] = (await getChatInfo(chatId)) as RoomsType[];
  return roomInfo;
};

const ChatPage = async ({ params }: ChatPageProps) => {
  const info = await getChat(params?.chatId);
  return (
    <>
      <ChatRoom chatId={+params.chatId} roomInfo={info} />
    </>
  );
};
export default ChatPage;
