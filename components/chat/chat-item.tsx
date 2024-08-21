import { messagesType, UserType } from "@/types";
import { dateFormatted } from "@/util/utils";
import { Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

type ChatItemProps = {
  message: messagesType;
  user: UserType | null;
  directMessage: ({ userId }: { userId: number }) => void;
  handleDelete: ({
    message_id,
    message_type,
    content,
  }: Partial<messagesType>) => void;
};

export const ChatItem = React.memo(
  ({ message, user, directMessage, handleDelete }: ChatItemProps) => {
    const {
      message_id,
      user_id,
      user_name,
      sent_at,
      content,
      message_type,
      photo_url,
    } = message;
    // composition
    const DirectMessageNotMe = ({
      children,
      userId,
    }: {
      children: React.ReactNode;
      userId: number;
    }) => {
      if (userId !== user?.user_id) {
        return (
          <div
            onClick={() => directMessage({ userId })}
            className="cursor-pointer"
          >
            {children}
          </div>
        );
      } else {
        return <div>{children}</div>;
      }
    };

    if (message_type === "system") {
      return (
        <div
          key={message_id}
          className="text-md flex items-center justify-center text-gray-500"
        >
          {content}
        </div>
      );
    }

    return (
      <div
        key={`${message_id}_${sent_at}`}
        className={"flex items-start gap-x-3 p-2"}
      >
        <DirectMessageNotMe userId={user_id}>
          {photo_url ? (
            <div className="relative flex h-12 w-12 items-center overflow-hidden rounded-full bg-white">
              <Image
                src={photo_url}
                alt={user_name}
                width={100}
                height={100}
                sizes="100vw"
                className="rounded-full"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-black"></div>
          )}
        </DirectMessageNotMe>
        <div className="anywhere flex w-full flex-col items-start">
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
);
