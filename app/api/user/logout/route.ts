import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    // 사용자가 존재하지 않는 경우 처리
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 },
      );
    }

    // 쿠키 삭제
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out",
      },
      { status: 200 },
    );

    // 쿠키 삭제 설정
    response.cookies.set("chat-token", "", {
      httpOnly: true,
      secure: false,
      maxAge: 0, // 즉시 만료시킴
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 },
    );
  }
}
