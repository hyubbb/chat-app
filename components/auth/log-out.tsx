import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/store/use-store";
import { UserType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LogOut, UserCog } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Logout = ({ user }: { user: UserType }) => {
  const { isEditModalOpen, setIsEditModalOpen } = useStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setToken, clearToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/user/logout",
        { user },
        { withCredentials: true },
      );

      if (res.status !== 200) throw new Error("로그아웃 실패");

      queryClient.setQueryData(["user"], []);
      queryClient.removeQueries({ queryKey: ["dmList"] });
      queryClient.removeQueries({ queryKey: ["joinRoomList"] });
      delete axios.defaults.headers.common["chat-token"];
      clearToken();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패 : ", error);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center gap-x-3">
        {user?.photo_url && (
          <Image
            src={user?.photo_url}
            width={40}
            height={40}
            sizes="100vw"
            alt={user?.user_name}
            className="h-12 w-12 rounded-full bg-white object-cover"
          />
        )}
        <span className="font-semibold dark:text-zinc-300">
          {user?.user_name}
        </span>
      </div>
      <div className="flex items-center gap-x-4">
        <button
          onClick={handleEditProfile}
          className="flex items-center space-x-1 rounded-md bg-yellow-400/80 px-4 py-2 text-white transition hover:bg-yellow-600"
        >
          <UserCog size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 rounded-md bg-red-400/80 px-4 py-2 text-white transition hover:bg-red-600"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
