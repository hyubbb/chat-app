import React from "react";
import { messagesType, UserType } from "@/types";
import { dateFormatted } from "@/util/utils";
import axios from "axios";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Loading } from "@/components/loading";
import { FileUploadModal } from "../modal/file-upload-modal";

type ChatMessageProps = {
  messages: messagesType[];
  user: UserType | null;
  chatId: number;
  isLoading?: boolean;
};

export const ChatMessage = ({
  messages,
  user,
  chatId,
  isLoading,
}: ChatMessageProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef, messages]);

  const handleDelete = async ({
    message_id,
    message_type,
    content,
  }: {
    message_id: number;
    message_type?: string;
    content?: string;
  }) => {
    const isDelete = confirm("삭제 하시겠습니까?");
    if (isDelete) {
      await axios.patch(`/api/socket/direct`, {
        messageId: message_id,
        userId: user?.user_id,
        chatId,
        message_type,
        content,
      });
    }
  };
  if (isLoading) return <Loading />;
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
              <div key={idx} className={"flex items-start gap-x-3 p-2"}>
                {photo_url ? (
                  <div>
                    <div className="flex h-12 w-12 items-center rounded-full bg-white">
                      <Image
                        src={photo_url}
                        width={100}
                        height={100}
                        alt={user_name}
                        sizes="100vw"
                        priority
                        className="rounded-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-black"></div>
                )}
                <div className="flex w-full flex-col items-start">
                  <div className="flex gap-x-3">
                    <span className="font-bold">{user_name}</span>
                    <span className="text-sm text-zinc-500/80">
                      {dateFormatted(sent_at)}
                    </span>
                  </div>
                  <div className="group flex w-full cursor-pointer items-center gap-x-2">
                    {message_type === "deleted" ? (
                      <div className="text-md text-gray-500">
                        <span>{content}</span>
                      </div>
                    ) : (
                      <>
                        {message_type === "image" ? (
                          <Image
                            src={content}
                            alt="Message Image"
                            width={200}
                            height={200}
                            priority
                            className="my-4 rounded-md"
                          />
                        ) : (
                          <>
                            <span>{content}</span>
                          </>
                        )}
                        {user?.user_id === user_id && (
                          <Trash
                            onClick={() =>
                              handleDelete({
                                message_id,
                                message_type,
                                content,
                              })
                            }
                            className="hidden cursor-pointer text-rose-700 group-hover:block"
                            size={16}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          },
        )}
      <div ref={bottomRef}></div>
      <FileUploadModal user={user} chatId={chatId} type="direct" />
    </div>
  );
};
