import { ChatRoom } from "@/components/chat/chat-room";

export const metadata = {
  title: "Chat page",
};

type ChatPageProps = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params }: ChatPageProps) => {
  console.log(params.chatId)
  // const userList = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/socket/chat/${params?.chatId}`);

  return (
    <>
      <ChatRoom chatId={params.chatId}   />
    </>
  );
};
export default ChatPage;
