import { useStore } from "@/hooks/use-store";
import axios from "axios";
import { set } from "firebase/database";
import { Plus, X } from "lucide-react";
import { FormEventHandler, use, useEffect, useRef, useState } from "react";

export const SignUpModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userInfo, setUserInfo] = useState({
    id: "",
    userName: "",
    password: "",
  });
  const { setIsSignUpModalOpen, isSignUpModalOpen } = useStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await axios.post(`/api/user/signup`, {
      id: userInfo.id,
      userName: userInfo.userName,
      password: userInfo.password,
    });
    const { success, data } = res.data;
    if (!success) {
      return alert("중복된 아이디입니다.");
    }

    setUserInfo({ id: "", userName: "", password: "" });

    return setIsSignUpModalOpen(false);
  };

  const handleClose = () => {
    setUserInfo({ id: "", userName: "", password: "" });
    setIsSignUpModalOpen(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSignUpModalOpen(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    if (isSignUpModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSignUpModalOpen]);

  if (!isSignUpModalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">회원가입</h2>
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
                placeholder="규정은 없습니다."
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="roomTitle"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                닉네임
              </label>
              <input
                type="text"
                id="name"
                value={userInfo.userName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, userName: e.target.value })
                }
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="규정은 없습니다."
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
                placeholder="규정은 없습니다."
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
