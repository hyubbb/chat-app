import { LogIn, UserPlus } from "lucide-react";
import { SignUpModal } from "../modal/signup-modal";
import { useStore } from "@/store/use-store";

export const Login = () => {
  const { setIsLoginModalOpen, setIsSignUpModalOpen } = useStore();
  return (
    <div className="flex w-full items-center justify-end space-x-2">
      <div className="flex items-center gap-x-3">
        <span className="font-semibold dark:text-zinc-300"></span>
      </div>
      <button
        onClick={() => setIsSignUpModalOpen(true)}
        className="flex items-center space-x-1 rounded-md bg-green-600/80 px-4 py-2 text-white transition hover:bg-green-500"
      >
        <UserPlus size={18} />
      </button>
      <button
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center space-x-1 rounded-md bg-blue-500/80 px-4 py-2 text-white transition hover:bg-blue-400"
      >
        <LogIn size={18} />
      </button>
      <SignUpModal />
    </div>
  );
};
