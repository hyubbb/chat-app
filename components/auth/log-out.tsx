import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { SignUpModal } from "./signup-modal";
import { LoginModal } from "./login-modal";
import { useStore } from "@/hooks/use-store";

export const Logout = () => {
  const { setIsLoginModalOpen, setIsSignUpModalOpen } = useStore();
  return (
    <div className="flex w-full items-center justify-end space-x-2">
      <div className="flex items-center gap-x-3">
        <span className="font-semibold dark:text-zinc-300"></span>
      </div>
      <button
        onClick={() => setIsSignUpModalOpen(true)}
        className="flex items-center space-x-1 rounded-md bg-green-500 px-4 py-2 text-white transition hover:bg-indigo-600"
      >
        <UserPlus size={18} />
        <span>회원가입</span>
      </button>
      <button
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center space-x-1 rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-indigo-600"
      >
        <LogIn size={18} />
        <span>로그인</span>
      </button>
      <SignUpModal />
      <LoginModal />
    </div>
  );
};
