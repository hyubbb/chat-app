import { useStore } from "@/store/use-store";
import { dmListType, messagesType, UserType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  user: UserType | null;
  chatId: number;
  dmInfo: dmListType | null;
};

export const ChatInput = ({ user, dmInfo }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const { setIsUploadModalOpen } = useStore();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    const startTime = performance.now(); // 메시지 전송 시점 기록
    setMessage("");
    const res = await axios.post("/api/socket/direct", {
      userId: user?.user_id,
      roomId: dmInfo?.room_id,
      message,
      startTime,
    });
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
            onChange={(e) => setMessage(e.target.value)}
            disabled={!!dmInfo?.other_user_leave}
          />
        </div>
      </form>
    </div>
  );
};
