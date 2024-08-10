import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loading } from "../loading";
import { FileUploadModal } from "../modal/file-upload-modal";
import { ChatItem } from "./chat-item";

type ChatMessageProps = {
  messages: messagesType[];
  user: UserType | null;
  chatId: number;
  isLoading?: boolean;
};

export const ChatMessage = ({
  messages,
  user,
  chatId,
  isLoading,
}: ChatMessageProps) => {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [init, setInit] = useState(true);
  useEffect(() => {
    if (init) {
      bottomRef?.current?.scrollIntoView({ behavior: "instant" });
      setTimeout(() => {
        setInit(false);
      }, 2000);
    } else {
      bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [bottomRef, messages, setInit, init]);

  const directMessage = ({ userId }: { userId: number }) => {
    router.push(`/direct/${userId}`);
  };

  const handleDelete = async ({
    message_id,
    message_type,
    content,
  }: Partial<messagesType>) => {
    const isDelete = confirm("삭제 하시겠습니까?");
    if (isDelete) {
      await axios.patch(`/api/socket/message`, {
        messageId: message_id,
        userId: user?.user_id,
        chatId,
        message_type,
        content,
      });
    }
  };
  if (isLoading) return <Loading />;
  return (
    <div className="mt-auto flex flex-col gap-y-2 overflow-y-auto overflow-x-hidden dark:text-zinc-300">
      {/* Chat messages would go here */}
      {messages &&
        messages?.map((data) => {
          return (
            <ChatItem
              key={`${data.message_id}_${data.sent_at}`}
              message={data}
              user={user}
              directMessage={directMessage}
              handleDelete={handleDelete}
            />
          );
        })}
      <div ref={bottomRef}></div>
      <FileUploadModal user={user} chatId={chatId} type="message" />
    </div>
  );
};
