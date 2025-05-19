import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ElementRef, Fragment, RefObject, useEffect, useState } from "react";
import { ChatItem } from "./chat-item";
import { Loader2 } from "lucide-react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { v4 as uuidv4 } from "uuid";
import { useMessageQuery } from "@/hooks/use-message-query";
import { Loading } from "@/components/loading";
import { FileUploadModal } from "@/components/modal/file-upload-modal";
import { useToastStore } from "@/store/use-toast-store";

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
  const { showToast } = useToastStore();
  const [hasInitialized, setHasInitialized] = useState(true);
  // useInfiniteQuery를 사용하여 메시지 데이터를 가져옴
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    reset,
  } = useMessageQuery({
    chatId,
    user,
  });

  // socket.on을 사용하여 메시지 소켓을 가져옴
  useMessageSocket({ chatId });

  const handleAlert = () => {
    showToast("새로운 메시지가 있습니다.", "success");
  };

  const { showNewMessageAlert, handleAlertClick } = useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    hasNewMessage: true,
    messagesData: messagesData,
    onNewMessageNotificationClick: handleAlert,
    hasInitialized,
    setHasInitialized,
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

  useEffect(() => {
    console.log("reset");
    // reset();
  }, []);

  if (status === "pending") {
    return <Loading />;
  }

  console.log("hasInitialized", hasInitialized);

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
          <Fragment key={`group_${i}`}>
            {group.messages.map((data: messagesType) => (
              <ChatItem
                key={`${data.message_id}_${data.sent_at}_${uuidv4().slice(0, 8)}`}
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
      <div id="bottom-marker" />
      <FileUploadModal
        user={user}
        chatId={chatId}
        bottomRef={bottomRef}
        type="message"
      />
    </div>
  );
};
