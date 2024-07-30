import { getCategoryRooms } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const categoryList = await getCategoryRooms();
    return NextResponse.json(categoryList);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
