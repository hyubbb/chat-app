"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) => {
  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`${getTypeStyles()} animate-in slide-in-from-right w-100 flex items-center justify-between gap-3 rounded-lg p-4 text-white shadow-lg`}
    >
      <p>{message}</p>
      <button
        onClick={onClose}
        className="rounded-md text-white hover:bg-gray-200"
      >
        <X size={18} />
      </button>
    </div>
  );
};
