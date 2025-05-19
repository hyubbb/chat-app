"use client";

import { useToastStore } from "@/store/use-toast-store";
import { Toast } from "./toast";

export const ToastContainer = () => {
  const { toasts, hideToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};
