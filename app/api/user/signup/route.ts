import { getUser } from "@/lib/firebaseSdk";
import { checkUserExists, createUser } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {}

export async function POST(request: NextRequest) {
  try {
    const { id, userName, password } = await request.json();

    // ID 중복 체크
    const userExists = await checkUserExists(id);
    if (userExists) {
      return NextResponse.json(
        { success: false }, // Conflict
      );
    }
    // 사용자 생성
    const newUser = await createUser(id, userName, password);
    return NextResponse.json({ data: newUser, success: true }); // Created
  } catch (error) {
    console.error("Error getting user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
