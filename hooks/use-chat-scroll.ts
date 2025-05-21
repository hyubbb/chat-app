import { messagesType } from "@/types";
import { CookingPot } from "lucide-react";
import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  hasNewMessage: boolean;
  setHasNewMessage: (value: boolean) => void;
  onNewMessageNotificationClick: () => void;
  messagesData: any;
  hasInitialized: boolean;
  setHasInitialized: (value: boolean) => void;
};

export const useChatScroll = ({
  chatRef,
  shouldLoadMore,
  loadMore,
  hasNewMessage,
  setHasNewMessage,
  messagesData,
  onNewMessageNotificationClick,
  hasInitialized,
  setHasInitialized,
}: ChatScrollProps) => {
  // const [hasInitialized, setHasInitialized] = useState(true);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [prevScrollOffset, setPrevScrollOffset] = useState<number | null>(null);
  // 스크롤 이벤트 핸들러 등록
  useEffect(() => {
    const topDiv = chatRef?.current;
    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;

      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }

      // 스크롤이 하단에 가까워지면 알림 숨김
      if (topDiv) {
        const distanceFromBottom =
          topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
        if (distanceFromBottom < 100) {
          setShowNewMessageAlert(false);
          setHasNewMessage(false);
        }
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);
    return () => topDiv?.removeEventListener("scroll", handleScroll);
  }, [shouldLoadMore, loadMore, chatRef]);

  // useEffect 혹은 함수 내에서 스크롤
  useEffect(() => {
    if (!hasInitialized) return;

    const el = document.getElementById("bottom-marker");
    // console.log("스크롤 초기화 실행", hasInitialized);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setHasInitialized(false);
    }
  }, [hasInitialized, messagesData]);

  // 새 메시지 알림 처리
  useEffect(() => {
    if (hasInitialized) return; // 초기화 전에는 알림 표시 안함
    console.log("hasNewMessage", hasNewMessage);
    if (hasNewMessage) {
      const chatContainer = chatRef?.current;
      if (!chatContainer) return;

      // 사용자가 이미 맨 아래에 있는지 확인
      const distanceFromBottom =
        chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight;

      // 사용자가 아래에 있지 않을 때만 알림 표시
      if (distanceFromBottom > 100) {
        // setShowNewMessageAlert(true);
        setHasNewMessage(true);
      } else {
        // 이미 하단에 있으면 자동으로 스크롤하고 알림 숨김
        // setShowNewMessageAlert(false);
        setHasNewMessage(false);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [hasNewMessage, chatRef, hasInitialized]);

  // 알림 클릭 핸들러
  const handleAlertClick = () => {
    const chatContainer = chatRef?.current;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setShowNewMessageAlert(false);
      setHasNewMessage(false);
      onNewMessageNotificationClick();
    }
  };

  // 새 메시지 오기 전에 "스크롤 위치"를 저장
  useEffect(() => {
    if (hasNewMessage && chatRef.current) {
      const chatEl = chatRef.current;

      const distanceFromBottom =
        chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight;

      setPrevScrollOffset(distanceFromBottom);
    }
  }, [hasNewMessage]);

  // 새 메시지가 렌더링된 후 스크롤 위치를 복원
  // useEffect(() => {
  //   if (prevScrollOffset !== null && chatRef.current) {
  //     const chatEl = chatRef.current;

  //     // 렌더링 이후 scrollTop을 이전 위치로 맞춤
  //     requestAnimationFrame(() => {
  //       chatEl.scrollTop =
  //         chatEl.scrollHeight - chatEl.clientHeight - prevScrollOffset;
  //       setPrevScrollOffset(null); // 초기화
  //     });
  //   }
  // }, [messagesData]);

  return {
    showNewMessageAlert,
    handleAlertClick,
  };
};
