import { create } from "zustand";
import { ToastType } from "@/components/ui/toast";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message, type = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    if (duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
