"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // ESC 키 이벤트 리스너 추가
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onCancel]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <p className="mb-4 text-gray-700 dark:text-gray-300">{message}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
