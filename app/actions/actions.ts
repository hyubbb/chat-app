"use server";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { UserType } from "@/types";
import {
  enteredDMList,
  getCategoryRooms,
  getUserInfo,
} from "@/lib/service/service";
import { redirect } from "next/navigation";

<<<<<<< HEAD
const SECRET_KEY = process.env.JWT_SECRET as string;

=======
// JWT 시크릿 키를 환경 변수에서 가져옵니다.
const ACCESS_KEY = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
// TODO: ACCESS_KEY가 undefined일 경우 처리 로직 추가 필요
if (!ACCESS_KEY) {
  throw new Error("JWT_SECRET is not defined");
}

// 초기의 왼쪽 메뉴 목록을 가져온다.
// user정보, DM List, 참여중인 채팅방 목록을 가져온다.
>>>>>>> 7e50f8a (feat: JWT토큰 리프레시 토큰 추가)
export const fetchData = async () => {
  const userResponse = await fetchCookiesUser();
  const userData = await userResponse?.json();
  const user = userData?.user;

  const [dmListResponse, categoriesResponse] = await Promise.all([
    user ? fetchDmList(user) : null,
    fetchCategories(),
  ]);

  const dmListData = user ? await dmListResponse?.json() : null;
  const categoriesData = (await categoriesResponse.json()) && null;

  return {
    user,
    dmList: dmListData?.data,
    categories: categoriesData,
  };
};

export const fetchCookiesUser = async () => {
  const cookieStore = cookies();
<<<<<<< HEAD
  const token = cookieStore.get("chat-token")?.value;
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET_KEY);
    return NextResponse.json({ user: decoded as UserType }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
=======
  const accessToken = cookieStore.get("access-token")?.value;
  // 액세스 토큰만 확인
  if (!accessToken) {
    return handleRefreshToken();
    // return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    // 액세스 토큰 검증
    const user = jwt.verify(accessToken, ACCESS_KEY) as UserType;
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    // verify 실패시,catch문이 실행된다.
    if (err instanceof jwt.TokenExpiredError) {
      // 액세스 토큰이 만료된 경우 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
      return handleRefreshToken();
    }
    return NextResponse.json({ user: null }, { status: 403 });
>>>>>>> 7e50f8a (feat: JWT토큰 리프레시 토큰 추가)
  }
};

export const fetchDmList = async (user: UserType) => {
  try {
    if (!user?.user_id) {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }

    const result = await enteredDMList(user?.user_id);
    return NextResponse.json({ data: result, success: true }, { status: 200 });
  } catch (error) {}
};

export const fetchCategories = async () => {
  try {
    const categoryList = await getCategoryRooms();
    return NextResponse.json(categoryList);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

// access-token이 만료되었을때, 리프레시 토큰을 사용하여 새로운 액세스 토큰을 생성한다.
export const handleRefreshToken = async () => {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh-token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ user: null });
  }

  try {
    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };
    // 유저 정보 가져오기
    const user = await getUserInfo(decoded.id);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 새로운 액세스 토큰 생성
    const newAccessToken = jwt.sign(user, ACCESS_KEY, { expiresIn: "15m" });

    const response = NextResponse.json({ user }, { status: 200 });

    // 새로운 액세스 토큰을 쿠키에 저장
    response.cookies.set("access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15분
      path: "/",
    });

    return response;
  } catch (err) {
    // 리프레시 토큰도 유효하지 않은 경우
    return NextResponse.json({ user: null }, { status: 401 });
  }
};
