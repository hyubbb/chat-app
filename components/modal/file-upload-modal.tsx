import { UseEsc } from "@/hooks/useEsc";
import { useStore } from "@/store/use-store";
import { UserType } from "@/types";
import axios from "axios";
import { ImageUp, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

type FileUploadModalProps = {
  user: UserType | null;
  chatId: number;
  type: string;
};

export const FileUploadModal = ({
  user,
  chatId,
  type,
}: FileUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const { setIsUploadModalOpen, isUploadModalOpen } = useStore();
  const { socket } = useStore();
  UseEsc(setIsUploadModalOpen);

  const handleClose = () => {
    setIsUploadModalOpen(false);
    setImageUrl(null);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (imageUrl === null) return;
    const startTime = performance.now(); // 메시지 전송 시점 기록
    const formData = new FormData();
    formData.append("photo", imageUrl as string);
    formData.append("photoName", imageName as string);
    formData.append("userId", user?.user_id + "");
    formData.append("chatId", chatId + "");
    formData.append("startTime", startTime + "");

    handleClose();

    if (type === "direct") {
      return await axios.post("/api/socket/direct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    socket?.emit("sendMessage", {
      photoName: imageName,
      userId: user?.user_id,
      chatId,
      startTime,
      photo: imageUrl,
    });
    // return await axios.post("/api/socket/message", formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
  };

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result && typeof e.target.result === "string") {
            setImageUrl(e.target.result);
            setImageName(file.name);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setImageUrl(null);
      }
    },
    [setImageUrl],
  );

  if (!isUploadModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">파일 업로드</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col items-center text-zinc-50">
              <input
                ref={fileInputRef}
                type="file"
                id="photo"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {imageUrl ? (
                <div className="relative flex items-center gap-x-3 text-zinc-200">
                  <Image
                    src={imageUrl}
                    alt="Profile preview"
                    width={150}
                    height={150}
                    className="bg-white"
                  />
                  <button
                    onClick={() => setImageUrl(null)}
                    className="absolute right-0 top-0 rounded-full bg-red-700 text-zinc-50"
                  >
                    <X />
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleImageClick}
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-dashed p-5 hover:bg-zinc-800"
                >
                  <ImageUp size={150} />
                  <div className="p-3 text-2xl">Click to upload a Image</div>
                </div>
              )}
            </div>
            <div className="flex w-full">
              <button
                type="submit"
                className="w-full rounded-md bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                전송
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
