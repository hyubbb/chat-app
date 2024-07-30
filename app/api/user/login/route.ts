import { getUser } from "@/lib/firebaseSdk";
import { checkUserExists, createUser, loginUser } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {}

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();
    // 로그인 정보 확인
    const user = (await loginUser(id, password)) as any;
    if (user?.length === 0) {
      return NextResponse.json(
        { success: false }, // Conflict
      );
    }

    return NextResponse.json({ data: user[0], success: true }); // Created
  } catch (error) {
    console.error("Error getting user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
