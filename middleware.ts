import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access-token");
  // console.log(accessToken);
}

export const config = {
  matcher: "/api/:path*", // API 경로에 대해 미들웨어 실행
};
