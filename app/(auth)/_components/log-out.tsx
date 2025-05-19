import { useAuthStore } from "@/store/authStore";
import { useStore } from "@/store/use-store";
import { UserType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LogOut, UserCog } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export const Logout = ({ user }: { user: UserType }) => {
  const { setIsEditModalOpen, setIsMenuModalOpen } = useStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname()?.split("/")[2];
  const mNumber = pathname ? parseInt(pathname) : 0;

  const { clearToken } = useAuthStore();
  const handleLogout = async () => {
    try {
      // 로그아웃 요청
      // 서버측 JWT 쿠키, 리프레시 토큰 삭제
      const res = await axios.post(
        "/api/user/logout",
        { user },
        { withCredentials: true },
      );

      if (res.status !== 200) throw new Error("로그아웃 실패");

      // 불필요한 query 제거
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["messages"] });
      queryClient.removeQueries({ queryKey: ["dmList"] });
      queryClient.removeQueries({ queryKey: ["joinRoomList"] });

      // 로그인관련 토큰 제거
      clearToken();

      // 메뉴 모달 닫기
      setIsMenuModalOpen(false);

      // 메인페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패 : ", error);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex items-center gap-x-2 max-sm:w-full" id="logout-btn">
      <div
        className="flex w-full items-center gap-2 text-nowrap max-sm:hidden"
        id="user-icon"
      >
        {user?.photo_url && (
          <Image
            src={user?.photo_url}
            width={40}
            height={40}
            alt={user?.user_name}
            className="h-[40px] w-[40px] rounded-full bg-white object-contain"
          />
        )}
        <span className="font-semibold dark:text-zinc-300">
          {user?.user_name}
        </span>
      </div>
      <div className="flex w-full items-center gap-x-4 p-[10px]">
        <button
          onClick={handleEditProfile}
          className="flex items-center justify-center space-x-1 rounded-md bg-yellow-400/80 px-4 py-2 text-white transition hover:bg-yellow-600 max-sm:flex-1"
        >
          <UserCog size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-1 rounded-md bg-red-400/80 px-4 py-2 text-white transition hover:bg-red-600 max-sm:flex-1"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
