"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshTokenPage() {
  console.log("RefreshToken-Page");
  const router = useRouter();

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const response = await fetch("/api/auth/refresh-token", {
          method: "POST",
        });
        if (response.ok) {
          const { token } = await response.json();
          // 새 토큰을 쿠키에 저장
          document.cookie = `auth_token=${token}; path=/; max-age=3600; secure; samesite=strict`;

          // 이전 페이지로 리다이렉트 (또는 홈페이지로)
          router.back();
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        router.push("/login");
      }
    };

    refreshToken();
  }, [router]);

  return <div>Refreshing your session...</div>;
}
