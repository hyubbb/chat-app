import { create } from "zustand";

interface AlertModalStore {
  isOpen: boolean;
  data: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
  onConfirm?: () => void;
  onClose?: () => void;
  open: (data: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onClose?: () => void;
  }) => void;
  close: () => void;
}

export const useAlertModal = create<AlertModalStore>((set) => ({
  isOpen: false,
  data: {
    title: "확인",
    description: "계속 진행하시겠습니까?",
    confirmLabel: "확인",
    cancelLabel: "취소",
  },
  onConfirm: undefined,
  onClose: undefined,
  open: (data) =>
    set({
      isOpen: true,
      data: {
        title: data.title || "확인",
        description: data.description || "계속 진행하시겠습니까?",
        confirmLabel: data.confirmLabel || "확인",
        cancelLabel: data.cancelLabel || undefined,
      },
      onConfirm: data.onConfirm,
      onClose: data.onClose,
    }),
  close: () =>
    set({
      isOpen: false,
      onConfirm: undefined,
      onClose: undefined,
    }),
}));
