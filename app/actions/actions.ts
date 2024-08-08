"use server";
import { cookies } from "next/headers";
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { UserType } from "@/types";
import { enteredDMList, getCategoryRooms } from "@/lib/service/service";

const SECRET_KEY = process.env.JWT_SECRET as string;

export const fetchCookiesUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("chat-token")?.value;
  try {
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET_KEY);
    return NextResponse.json({ user: decoded as UserType }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
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
