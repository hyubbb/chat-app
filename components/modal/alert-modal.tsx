"use client";

import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useAlertModal } from "@/store/use-alert-modal";

interface AlertModalData {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const AlertModal = () => {
  const { isOpen, data, onConfirm, onClose, close } = useAlertModal();
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      close();
      onClose?.();
    }, 300);
  }, [close, onClose]);

  const handleConfirm = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      close();
      onConfirm?.();
    }, 300);
  }, [close, onConfirm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-neutral-800/70 outline-none focus:outline-none"
      onClick={handleClose}
    >
      <div
        role="document"
        className="relative mx-auto my-6 h-auto w-full max-w-sm md:h-auto md:w-4/6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <div className={`translate h-full duration-300`} > */}

        <div
          className={`translate h-full duration-300 ${
            showModal
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          } `}
        >
          <article className="translate relative flex h-full w-full flex-col rounded-lg border-0 bg-[#cecece] shadow-lg outline-none focus:outline-none">
            <header className="relative flex items-center justify-between rounded-t border-b p-6 dark:border-zinc-700">
              <h2 id="alert-modal-title" className="text-lg font-semibold">
                {data.title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 transition hover:bg-slate-400 hover:opacity-70"
                aria-label="닫기"
              >
                <IoClose size={18} />
              </button>
            </header>

            <main className="relative flex-auto p-6">
              <p
                id="alert-modal-description"
                className="text-sm leading-relaxed text-black"
              >
                {data.description}
              </p>
            </main>

            <footer className="flex flex-col gap-2 p-6 pt-0">
              <div className="flex w-full flex-row items-center gap-4">
                <button
                  type="button"
                  className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                  onClick={handleConfirm}
                >
                  {data.confirmLabel}
                </button>
                {data.cancelLabel && (
                  <button
                    type="button"
                    className="w-full rounded-lg bg-neutral-200 px-4 py-2 transition hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:focus:ring-offset-zinc-900"
                    onClick={handleClose}
                  >
                    {data.cancelLabel}
                  </button>
                )}
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
};
