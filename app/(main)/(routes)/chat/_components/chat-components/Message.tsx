import { messagesType, UserType } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, {
  ElementRef,
  Fragment,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useMessageSocket } from "@/hooks/use-message-socket";
import { v4 as uuidv4 } from "uuid";
import { useMessageQuery } from "@/hooks/use-message-query";
import { Loading } from "@/components/loading";
import { FileUploadModal } from "@/components/modal/file-upload-modal";
import { useToastStore } from "@/store/use-toast-store";
import NewMessageButton from "../NewMessageButton";
import { Item } from "./Item";

type ChatMessageProps = {
  user: UserType | null;
  chatId: number;
  bottomRef: RefObject<ElementRef<"div">>;
};

export const Message = React.memo(
  ({ user, chatId, bottomRef }: ChatMessageProps) => {
    const router = useRouter();
    const { showToast } = useToastStore();
    const [hasInitialized, setHasInitialized] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const chatRef = useRef<HTMLDivElement>(null);

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

    const handleLoadMore = async () => {
      const container = chatRef.current;
      if (!container || isFetchingNextPage) return;

      const previousScrollHeight = container.scrollHeight;

      if (!isFetchingNextPage) {
        await fetchNextPage();
      }

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const diff = newScrollHeight - previousScrollHeight;
        container.scrollTop = container.scrollTop + diff;
      });
    };

    useMessageSocket({
      chatId,
      userId: user?.user_id || 0,
      onMessageReceive: ({ messages_type }: { messages_type: string }) => {
        const container = chatRef?.current;
        if (!container) return;
        if (messages_type === "message") {
          const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
          if (distanceFromBottom > 50) {
            setHasNewMessage(true);
          }
        }
      },
    });

    const handleAlert = () => {
      // showToast("새로운 메시지가 있습니다.", "success");
    };

    const { showNewMessageAlert, handleAlertClick } = useChatScroll({
      chatRef,
      loadMore: handleLoadMore,
      shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
      hasNewMessage,
      setHasNewMessage,
      messagesData,
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
      setHasInitialized(true);
      return () => setHasInitialized(false);
    }, []);

    useEffect(() => {
      if (chatRef.current) {
        const updateWidth = () => {
          const width = chatRef.current?.getBoundingClientRect().width || 0;
          setContainerWidth(width);
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);

        return () => {
          window.removeEventListener("resize", updateWidth);
        };
      }
    }, [chatRef]);

    if (status === "pending") {
      return <Loading />;
    }

    return (
      <div
        ref={chatRef}
        className="relative flex flex-1 flex-col gap-y-2 overflow-y-auto overflow-x-hidden dark:text-zinc-300"
      >
        {!hasNextPage && <div className="flex-1" />}
        {hasNextPage && (
          <div className="flex justify-center">
            {isFetchingNextPage ? (
              <Loader2 className="my-5 h-6 w-6 animate-spin text-zinc-500" />
            ) : (
              <button
                onClick={handleLoadMore}
                className="my-4 text-sm text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                이전 메시지 불러오기
              </button>
            )}
          </div>
        )}
        <div
          id="chat-message-container"
          className="mt-auto flex flex-col-reverse"
        >
          {messagesData?.pages?.map((group, i) => (
            <Fragment key={`group_${i}`}>
              {group.messages.map((data: messagesType) => (
                <Item
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

        {hasNewMessage && (
          <NewMessageButton
            containerWidth={containerWidth}
            handleAlertClick={handleAlertClick}
          />
        )}

        <FileUploadModal
          user={user}
          chatId={chatId}
          bottomRef={bottomRef}
          type="message"
        />
      </div>
    );
  },
);

Message.displayName = "ChatMessage";
