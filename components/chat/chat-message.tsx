import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ElementRef, Fragment, RefObject, useState } from "react";
import { Loading } from "../loading";
import { FileUploadModal } from "../modal/file-upload-modal";
import { ChatItem } from "./chat-item";
import { Loader2 } from "lucide-react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useMessageQuery } from "@/hooks/use-message.query";
import { useMessageSocket } from "@/hooks/use-message-socket";

type ChatMessageProps = {
  user: UserType | null;
  chatId: number;
  chatRef: RefObject<ElementRef<"div">>;
  bottomRef: RefObject<ElementRef<"div">>;
};

export const ChatMessage = ({
  user,
  chatId,
  chatRef,
  bottomRef,
}: ChatMessageProps) => {
  const router = useRouter();
  const [init, setInit] = useState(true);

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

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
  });

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
      className="flex flex-1 flex-col gap-y-2 overflow-y-auto overflow-x-hidden dark:text-zinc-300"
    >
      {!hasNextPage && <div className="flex-1" />}

      {hasNextPage && (
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

      <div className="mt-auto flex flex-col-reverse">
        {messagesData?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.messages.map((data: messagesType) => (
              <ChatItem
                key={`${data.message_id}_${data.sent_at}`}
                message={data}
                user={user}
                directMessage={directMessage}
                handleDelete={handleDelete}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div ref={bottomRef} />

      <FileUploadModal user={user} chatId={chatId} type="message" />
    </div>
  );
};
