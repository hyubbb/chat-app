import { messagesType } from "@/types";
import { CookingPot } from "lucide-react";
import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  hasNewMessage: boolean;
  onNewMessageNotificationClick: () => void;
  messagesData: any;
  hasInitialized: boolean;
  setHasInitialized: (value: boolean) => void;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  hasNewMessage,
  messagesData,
  onNewMessageNotificationClick,
  hasInitialized,
  setHasInitialized,
}: ChatScrollProps) => {
  // const [hasInitialized, setHasInitialized] = useState(true);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);

  // 스크롤 이벤트 핸들러 등록
  useEffect(() => {
    const topDiv = chatRef?.current;
    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;

      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }
    };

    topDiv?.addEventListener("scroll", handleScroll);
    return () => topDiv?.removeEventListener("scroll", handleScroll);
  }, [shouldLoadMore, loadMore, chatRef]);

  // 초기 스크롤 설정 - 채팅 컨테이너 사용
  // useEffect(() => {
  //   if (hasInitialized) return;
  //   console.log("hasInitialized", hasInitialized);
  //   const chatContainer = chatRef?.current;
  //   if (chatContainer) {
  //     console.log("chatContainer", chatContainer);
  //     // 채팅 컨테이너의 스크롤을 맨 아래로 설정
  //     chatContainer.scrollTop = chatContainer.scrollHeight;
  //     setHasInitialized(true);
  //   }
  // }, [chatRef?.current, hasInitialized]);

  // useEffect(() => {
  //   if (!hasInitialized) return; // 초기화 전에는 알림 표시 안함
  //   console.log(hasInitialized, bottomRef.current, messagesData);
  //   if (bottomRef.current && messagesData?.length > 0) {
  //     bottomRef.current?.scrollIntoView();
  //     setHasInitialized(false);
  //   }
  // }, [bottomRef?.current, hasInitialized, messagesData]);

  // useEffect 혹은 함수 내에서 스크롤
  useEffect(() => {
    if (!hasInitialized || messagesData?.length === 0) return;

    const el = document.getElementById("bottom-marker");
    console.log("스크롤 초기화 실행", hasInitialized);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setHasInitialized(false);
    }
  }, [messagesData, hasInitialized]);

  // 새 메시지 알림 처리
  useEffect(() => {
    if (hasInitialized) return; // 초기화 전에는 알림 표시 안함

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
        setShowNewMessageAlert(true);
      } else {
        // 이미 하단에 있으면 자동으로 스크롤
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
      onNewMessageNotificationClick();
    }
  };

  return {
    showNewMessageAlert,
    handleAlertClick,
  };
};
