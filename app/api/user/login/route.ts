import { loginUser } from "@/lib/service/service";
import { UserType } from "@/types";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.JWT_SECRET as string;

// 로그인 처리를 하고, JWT를 생성하여 쿠키에 저장
export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();
    // 로그인 정보 확인
    const [user] = (await loginUser(id, password)) as UserType[];

    // 사용자가 존재하지 않는 경우 처리
    if (!user) {
      return NextResponse.json({ success: false });
    }

    // JWT 생성
    const token = jwt.sign(
      {
        id: user.id,
        user_id: user.user_id,
        user_name: user.user_name,
        photo_url: user.photo_url,
        role: user.role,
      },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    // // JWT를 HttpOnly 쿠키로 설정
    const response = NextResponse.json(
      { success: true, token },
      { status: 200 },
    );
    response.cookies.set("chat-token", token, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error getting user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
