import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categoriesRooms = await getCategoryRooms();

    return NextResponse.json({
      status: 200,
      success: true,
      data: categoriesRooms,
    });
  } catch (error) {
    console.error("Error fetching rooms with users:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch rooms and users" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
export async function POST(request: Request) {}
