import { getUser } from "@/lib/firebaseSdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }
  const token = authHeader.split("Bearer ")[1];

  try {
    const user = await getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
