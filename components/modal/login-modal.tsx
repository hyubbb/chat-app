import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/store/use-store";
import axios from "axios";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const LoginModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoginModalOpen, setIsLoginModalOpen, setIsMenuModalOpen } =
    useStore();
  const [userInfo, setUserInfo] = useState({
    id: "",
    password: "",
  });
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/user/login`, {
        id: userInfo.id,
        password: userInfo.password,
      });
      const { success, token } = res.data;
      if (!success) {
        return alert("아이디 또는 비밀번호가 일치하지 않습니다.");
      }
      setToken(token);
      setUserInfo({ id: "", password: "" });
      setIsMenuModalOpen(false);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Error getting user:", error);
    }
  };
  const handleClose = () => {
    setUserInfo({ id: "", password: "" });
    if (pathname !== "/") {
      router.back();
    }
    setIsLoginModalOpen(false);
  };

  useEffect(() => {
    if (isLoginModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  if (!isLoginModalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">로 그 인</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="roomTitle"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                아이디
              </label>
              <input
                ref={inputRef}
                type="text"
                id="id"
                value={userInfo.id}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, id: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="admin 을 입력해보세요."
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="roomTitle"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={userInfo.password}
                autoComplete="off"
                onChange={(e) =>
                  setUserInfo({ ...userInfo, password: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="admin 을 입력해보세요."
              />
            </div>
            <div className="flex justify-end">
              <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                완료
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
