import { create } from "zustand";

interface ConfirmStore {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showConfirm: (props: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "확인",
  cancelText: "취소",
  onConfirm: undefined,
  onCancel: undefined,
  showConfirm: ({
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  }) => {
    set({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => set({ isOpen: false })),
    });
  },
  closeConfirm: () => {
    set({
      isOpen: false,
      onConfirm: undefined,
      onCancel: undefined,
    });
  },
}));
