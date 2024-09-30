import { NextRequest, NextResponse } from "next/server";
export async function middleware(req: NextRequest) {}

export const config = {
  matcher: "/api/:path*", // API 경로에 대해 미들웨어 실행
};
