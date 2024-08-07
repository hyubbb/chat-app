import { getCategoryRooms, getChatInfo } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  try {
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
