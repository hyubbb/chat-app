import { useStore } from "@/store/use-store";
import { UserType } from "@/types";
import { Plus } from "lucide-react";
import { ElementRef, RefObject, useEffect, useRef, useState } from "react";

type ChatInputProps = {
  user: UserType | null;
  chatId: number;
  bottomRef: RefObject<ElementRef<"div">>;
};

export const ChatInput = ({ user, chatId, bottomRef }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { socket } = useStore();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false); // 메시지 전송 상태 관리
  const { setIsUploadModalOpen } = useStore();
  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef, isSending]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message) return;
    if (isSending) return; // 메시지 전송 중에는 입력창 비활성화
    setMessage("");
    setIsSending(true); // 메시지 전송 상태 변경
    const startTime = performance.now(); // 메시지 전송 시점 기록
<<<<<<< HEAD

=======
>>>>>>> 868249151e5c197e422d8a160e6cc717e549299a
    // socket.io 방식
    socket?.emit(
      "sendMessage",
      {
        userId: user?.user_id,
        chatId,
        message,
        startTime,
      },
      (data: any) => {
        if (data.success) {
          setIsSending(false);
          setTimeout(() => {
            bottomRef?.current?.scrollIntoView({ behavior: "instant" });
          }, 100);
        }
      },
    );

<<<<<<< HEAD
    // api 호출 방식
=======
    // api 호출 방식 비교용 코드
>>>>>>> 868249151e5c197e422d8a160e6cc717e549299a
    // await axios.post("/api/socket/message", {
    //   userId: user?.user_id,
    //   chatId,
    //   message,
    // });
  };

  const HandleFileModal = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="border-t-2 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={HandleFileModal}
            className="absolute left-2 flex h-[25px] w-[25px] items-center justify-center rounded-full bg-zinc-300 p-1 transition hover:bg-zinc-500"
          >
            <Plus size={40} />
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="메시지를 입력하세요..."
            className="w-full rounded-md border px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            disabled={isSending}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
};
