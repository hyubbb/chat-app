import { getCategoryRooms } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";

// 카테고리 리스트와 각 카테고리의 rooms 데이터를 가져옴
export async function GET(request: NextRequest) {
  try {
    const categoryList = await getCategoryRooms();
    return NextResponse.json(categoryList);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
