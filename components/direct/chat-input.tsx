import { UserType } from "@/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  user: UserType | null;
  chatId: number;
};

export const ChatInput = ({ user, chatId }: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    await axios.post("/api/socket/direct", {
      userId: user?.user_id,
      chatId,
      message,
    });
  };
  return (
    <div className="border-t-2 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="메시지를 입력하세요..."
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </div>
  );
};
