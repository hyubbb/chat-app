import { useStore } from "@/store/use-store";
import { dmListType, messagesType, UserType } from "@/types";
import { createDMRoomId } from "@/util/utils";
import axios from "axios";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  user: UserType | null;
  chatId: number;
  dmInfo: dmListType | null;
};

export const ChatInput = ({ user, chatId, dmInfo }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const { setIsUploadModalOpen } = useStore();

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  console.log("dmInfo:", dmInfo);
  console.log("dmInfo?.other_user_leave:", dmInfo?.other_user_leave);
  console.log(
    "typeof dmInfo?.other_user_leave:",
    typeof dmInfo?.other_user_leave,
  );
  console.log(
    "dmInfo?.other_user_leave === 1:",
    dmInfo?.other_user_leave === 1,
  );
  console.log("dmInfo?.other_user_leave == 1:", dmInfo?.other_user_leave == 1);

  const isDisabled = dmInfo?.other_user_leave === 1;
  console.log("isDisabled:", isDisabled);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() || !user || !user.user_id) return;

    try {
      setMessage("");
      const startTime = performance.now(); // 메시지 전송 시점 기록

      // roomId가 없으면 DM roomId를 생성
      const roomId = dmInfo?.room_id || createDMRoomId(user.user_id, chatId);

      const res = await axios.post("/api/socket/direct", {
        userId: user.user_id,
        roomId: roomId,
        message,
        startTime,
      });

      console.log("메시지 전송 성공:", res.data);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessage(message); // 실패시 메시지 복원
    }
  };

  const HandleFileModal = () => {
    setIsUploadModalOpen(true);
  };

  const placeholder = isDisabled
    ? "상대방이 대화방을 나가서 메시지를 보낼 수 없습니다."
    : "메시지를 입력하세요...";

  return (
    <div className="border-t-2 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={HandleFileModal}
            className={`absolute left-2 flex h-[25px] w-[25px] items-center justify-center rounded-full p-1 transition ${
              isDisabled
                ? "cursor-not-allowed bg-gray-400"
                : "bg-zinc-300 hover:bg-zinc-500"
            }`}
            disabled={isDisabled}
          >
            <Plus size={40} />
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className={`w-full rounded-md border px-3 py-2 pl-10 focus:outline-none ${
              isDisabled
                ? "cursor-not-allowed bg-gray-100 text-gray-500"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDisabled}
          />
        </div>
      </form>
    </div>
  );
};
