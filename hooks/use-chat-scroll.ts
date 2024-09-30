import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

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

  // 스크롤 자동 스크롤 처리
  useEffect(() => {
    const topDiv = chatRef?.current;
    const bottomDiv = bottomRef?.current;
    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) {
        return false;
      }

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      return distanceFromBottom <= 100;
    };

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    return () => {};
  }, [chatRef, bottomRef, hasInitialized]);
};
