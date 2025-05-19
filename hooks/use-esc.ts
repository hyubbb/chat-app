"use client";

import { useEffect } from "react";

/**
 * ESC 키 입력을 감지하여 함수를 실행하는 훅
 * @param callback ESC 키 입력 시 실행할 함수
 */
export const useEsc = (callback: (value: boolean) => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        callback(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [callback]); // callback을 종속성 배열에 추가
};
