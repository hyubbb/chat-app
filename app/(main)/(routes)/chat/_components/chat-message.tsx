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
  bottomRef: RefObject<ElementRef<"div">>;
};

export const ChatMessage = React.memo(
  ({ user, chatId, bottomRef }: ChatMessageProps) => {
    const router = useRouter();
    const { showToast } = useToastStore();
    const [hasInitialized, setHasInitialized] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const chatRef = useRef<HTMLDivElement>(null);
    const newMessageRef = useRef<HTMLDivElement>(null);
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

    const handleLoadMore = async () => {
      const container = chatRef.current;
      if (!container) return;

      const previousScrollHeight = container.scrollHeight;

      // await fetchNextPage(); // 메시지 불러오기 (렌더링이 이 다음에 발생)

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const diff = newScrollHeight - previousScrollHeight;

        // 기존 위치를 유지하기 위해 scrollTop을 증가시켜 줌
        container.scrollTop = container.scrollTop + diff;
      });
    };

    // socket.on을 사용하여 메시지 소켓을 가져옴
    useMessageSocket({
      chatId,
      userId: user?.user_id || 0,
      onMessageReceive: () => {
        setHasNewMessage(true); // 새로운 메시지가 왔음을 알림
        // showToast("새로운 메시지가 있습니다.", "success");
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

    // useEffect(() => {
    //   if (hasInitialized) {
    //     reset();
    //   }
    // }, [reset, hasInitialized]);

    useEffect(() => {
      if (chatRef.current) {
        const updateWidth = () => {
          const width = chatRef.current?.getBoundingClientRect().width || 0;
          setContainerWidth(width);
        };

        // 초기 너비 설정
        updateWidth();

        // 창 크기가 변경될 때 너비 업데이트
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

        {hasNewMessage && (
          <div
            className="fixed bottom-3 z-10 flex w-full justify-end px-4"
            style={{
              maxWidth: containerWidth ? `${containerWidth}px` : "auto",
              right: "50%",
              transform: "translateX(50%)",
            }}
          >
            <button
              onClick={handleAlertClick}
              className="h-[40px] rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg transition hover:bg-blue-600"
            >
              ⬇ 새로운 메시지 보기
            </button>
          </div>
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
