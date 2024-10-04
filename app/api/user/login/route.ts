import { loginUser, serverRefreshToken } from "@/lib/service/service";
import { UserType } from "@/types";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// JWT 비밀 키를 환경 변수에서 가져옴
const ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET as string;

// 로그인 처리를 하고, JWT를 생성하여 쿠키에 저장
export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();
    // 로그인 정보 확인
    const [user] = (await loginUser(id, password)) as UserType[];

    // 사용자정보가 서버에 존재하지 않는 경우
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
        status: 404,
        user: null,
      });
    }

    // 액세스 토큰 생성
    const accessToken = jwt.sign(user, ACCESS_SECRET_KEY, { expiresIn: "1m" });

    // 리프레시 토큰 생성
    const refreshToken = jwt.sign(
      { id: user.user_id },
      REFRESH_SECRET_KEY,
      { expiresIn: "7d" }, // 리프레시 토큰의 유효 기간을 7일로 설정
    );

    // 로그인 성공 메세지 반환 및 쿠키에 JWT 저장

    const response = NextResponse.json(
      { success: true, accessToken },
      { status: 200 },
    );

    // 액세스 토큰을 쿠키에 저장
    response.cookies.set("access-token", accessToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 1 * 60, // 15분으로 설정 (JWT expiresIn과 일치)
      sameSite: "lax",
    });

    // 리프레시 토큰을 쿠키에 저장
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7일
      sameSite: "lax",
    });

    // 리프레시 토큰을 데이터베이스에 저장
    await serverRefreshToken(user.user_id!, refreshToken);

    return response;
  } catch (error) {
    console.error("Error getting user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
