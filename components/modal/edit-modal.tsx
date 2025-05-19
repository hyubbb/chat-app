import { useSignUpForm } from "@/hooks/use-signup-form";
import { useSignUpSubmit } from "@/hooks/use-signup-submit";
import { UseEsc } from "@/hooks/use-esc";
import { useStore } from "@/store/use-store";
import { useFormType, UserType } from "@/types";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export const EditModal = ({ user }: { user: UserType | null }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { setIsEditModalOpen, isEditModalOpen } = useStore();

  const methods = useSignUpForm();
  const { register, handleSubmit, errors, reset, watch } = methods;
  const { onSubmit, handleFileChange } = useSignUpSubmit(
    setIsEditModalOpen,
    setPreviewUrl,
    user?.photo_url,
  );

  const userName = watch("userName");

  const handleClose = () => {
    reset();
    setIsEditModalOpen(false);
  };

  UseEsc(setIsEditModalOpen);

  useEffect(() => {
    if (isEditModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (user) {
      reset({
        userId: user?.user_id!,
        userName: user?.user_name,
        photo: user?.photo_url ?? null,
      });
      setPreviewUrl(user?.photo_url);
    }
  }, [user, reset]);

  useEffect(() => {
    if (previewUrl) {
      setPreviewUrl(previewUrl);
    }
  }, [previewUrl]);

  const onSubmitWrapper = (data: useFormType) => {
    if (data?.photo?.length === 0) {
      data = { ...data, photo: user?.photo_url as string };
    }
    onSubmit(data, reset, true);
  };

  if (!isEditModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            회원정보 수정
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmitWrapper)}>
            <div className="mb-6">
              <label
                htmlFor="userName"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                닉네임
              </label>
              <input
                {...register("userName")}
                type="text"
                id="userName"
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="3~20자 까지 가능"
              />
              {errors.userName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.userName.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="photo"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                프로필 사진
              </label>
              <input
                {...register("photo")}
                type="file"
                id="photo"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {previewUrl && (
                <div className="mt-6 flex items-center gap-x-3 text-zinc-200">
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    width={40}
                    height={40}
                    priority
                    className="rounded-full bg-white"
                  />
                  <span>{userName}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                수정하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
