import { messagesType, UserType } from "@/types";
import { dateFormatted } from "@/util/utils";
import axios from "axios";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type ChatMessageProps = {
  messages: messagesType[];
  user: UserType | null;
  chatId: number;
};

export const ChatMessage = ({ messages, user, chatId }: ChatMessageProps) => {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef, messages]);

  // composition
  const DirectMessageNotMe = ({
    children,
    userId,
  }: {
    children: React.ReactNode;
    userId: number;
  }) => {
    if (userId !== user?.user_id) {
      return <div onClick={() => directMessage(userId)}>{children}</div>;
    } else {
      return <div>{children}</div>;
    }
  };

  const directMessage = (userId: number) => {
    router.push(`/direct/${userId}`);
  };

  const handleDelete = async ({ message_id }: { message_id: number }) => {
    const isDelete = confirm("삭제 하시겠습니까?");
    if (isDelete) {
      await axios.patch(`/api/socket/message`, {
        messageId: message_id,
        userId: user?.user_id,
        chatId,
      });
    }
  };
  // return null;
  return (
    <div className="mt-auto flex flex-col gap-y-2 overflow-y-auto dark:text-zinc-300">
      {/* Chat messages would go here */}
      <div>
        <div className="text-md flex items-center justify-center text-gray-500">
          채팅을 시작해보세요!
        </div>
      </div>
      {messages &&
        messages?.map(
          (
            {
              message_id,
              user_id,
              user_name,
              sent_at,
              content,
              message_type,
              photo_url,
            },
            idx,
          ) => {
            if (message_type === "system") {
              return (
                <div
                  key={idx}
                  className="text-md flex items-center justify-center text-gray-500"
                >
                  {content}
                </div>
              );
            }
            return (
              <div key={idx} className={"flex items-center gap-x-3 p-2"}>
                <DirectMessageNotMe userId={user_id}>
                  {photo_url ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                      <Image src={photo_url} fill alt={user_name} />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-black"></div>
                  )}
                </DirectMessageNotMe>
                <div className="flex w-full flex-col items-start">
                  <div className="flex gap-x-3">
                    <span className="font-bold">{user_name}</span>
                    <span className="text-sm text-zinc-500/80">
                      {dateFormatted(sent_at)}
                    </span>
                  </div>
                  <div className="group flex w-full items-center gap-x-2">
                    {message_type === "deleted" ? (
                      <div className="text-md text-gray-500">
                        <span>{content}</span>
                      </div>
                    ) : (
                      <>
                        {user?.id === user_id && (
                          <Trash
                            onClick={() => handleDelete({ message_id })}
                            className="hidden cursor-pointer text-rose-700 group-hover:block"
                            size={16}
                          />
                        )}

                        <span>{content}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          },
        )}
      <div ref={bottomRef}></div>
    </div>
  );
};
