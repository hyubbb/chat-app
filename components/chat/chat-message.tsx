import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useMemo, useState } from "react";
import { Loading } from "../loading";
import { FileUploadModal } from "../modal/file-upload-modal";
import { ChatItem } from "./chat-item";
import { Loader2 } from "lucide-react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useMessageQuery } from "@/hooks/use-message.query";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { InfiniteData } from "@tanstack/react-query";

type ChatMessageProps = {
  user: UserType | null;
  chatId: number;
  chatRef: RefObject<HTMLDivElement>;
  bottomRef: RefObject<HTMLDivElement>;
};
type GetMessagesResult = {
  messages: messagesType[];
  nextPage: number | undefined;
};

export const ChatMessage = ({
  user,
  chatId,
  chatRef,
  bottomRef,
}: ChatMessageProps) => {
  const router = useRouter();

  // const [init, setInit] = useState(true);

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useMessageQuery({
    chatId,
    user,
  });
  useMessageSocket({ chatId });
  const messages = useMemo(() => {
    if (!messagesData) return [];

    // TypeScript에게 messagesData의 타입을 알려줍니다
    const typedMessagesData = messagesData as InfiniteData<GetMessagesResult>;

    // 페이지를 복사하고 역순으로 정렬
    const reversedPages = [...typedMessagesData.pages].reverse();

    // 각 페이지의 메시지를 flatMap으로 연결
    return reversedPages.flatMap((page) => page.messages);
  }, [messagesData]);

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
  });

  // useEffect(() => {
  //   if (init) {
  //     bottomRef?.current?.scrollIntoView({ behavior: "instant" });
  //     const timer = setTimeout(() => setInit(false), 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [init, bottomRef]);

  // useEffect(() => {
  //   if (!init) {
  //     bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [init, bottomRef, messages]);

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

  if (status === "pending") {
    return <Loading />;
  }

  return (
    <div
      ref={chatRef}
      className="mt-auto flex flex-col gap-y-2 overflow-y-auto overflow-x-hidden dark:text-zinc-300"
    >
      {!hasNextPage && <div className="flex-1" />}
      {/* {!hasNextPage && <ChatWelcome type={type} name={name} />} */}

      {hasNextPage && messages.length > 20 && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="my-5 h-6 w-6 animate-spin text-zinc-500" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="my-4 text-sm text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              이전 메시지 불러오기
            </button>
          )}
        </div>
      )}

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
      <FileUploadModal user={user} chatId={chatId} type="message" />
      <div ref={bottomRef}></div>
    </div>
  );
};
