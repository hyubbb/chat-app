import { UserType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const Login = ({ user }: { user: UserType }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = () => {
    // queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.setQueryData(["user"], null);
    // router.refresh();
  };

  return (
    <div className="flex w-full items-center justify-between space-x-2">
      <div className="flex items-center gap-x-3">
        {user?.photo_url && (
          <Image
            src={user?.photo_url}
            width={40}
            height={40}
            alt="JD"
            className="rounded-full"
          />
        )}
        <span className="font-semibold dark:text-zinc-300">
          {user?.user_name}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-1 rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
      >
        <LogOut size={18} />
        <span>로그아웃</span>
      </button>
    </div>
  );
};
