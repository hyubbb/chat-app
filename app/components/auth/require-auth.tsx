import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useStore } from "@/store/use-store";
import { useUserQuery } from "@/store/use-user-query";

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { setIsLoginModalOpen } = useStore();
  const { data: user, isLoading } = useUserQuery();

  if (isLoading) {
    return null; // 또는 로딩 컴포넌트
  }

  if (!user) {
    setIsLoginModalOpen(true);
    return null;
  }

  return <>{children}</>;
};
