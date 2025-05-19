"use client";

import { useConfirmStore } from "@/store/use-confirm-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const ConfirmDialogProvider = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    closeConfirm,
  } = useConfirmStore();

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirm();
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};
