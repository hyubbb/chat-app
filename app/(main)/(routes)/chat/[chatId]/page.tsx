import { ChatRoom } from "@/components/chat/chat-room";

export const metadata = {
  title: "Chat page",
};

type ChatPageProps = {
  params: {
    chatId: number;
  };
};

const ChatPage = async ({ params }: ChatPageProps) => {
  return (
    <>
      <ChatRoom chatId={+params.chatId} />
    </>
  );
};
export default ChatPage;
