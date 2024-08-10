import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserType } from "@/types";
import { dateName } from "@/util/utils";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getUserInfo, updateUser } from "@/lib/service/service";

const SECRET_KEY = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("chat-token");

  if (!tokenCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const token = tokenCookie.value;

  try {
    if (!token) {
      return new Response(JSON.stringify({ message: "Token not provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    if (typeof decoded !== "object" || decoded === null) {
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return NextResponse.json({ user: decoded as UserType }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
}
const generateJWT = (user: UserType) => {
  const payload = {
    id: user.id,
    user_id: user.user_id,
    user_name: user.user_name,
    photo_url: user.photo_url,
    role: user.role,
  };

  const secretKey = process.env.JWT_SECRET as string; // 환경 변수에서 비밀 키를 가져옵니다
  const options = {
    expiresIn: "1h", // 토큰 만료 시간 (예: 1시간)
  };

  return jwt.sign(payload, secretKey, options);
};

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photo") as File[];
    const name = formData.get("userName") as string;
    const userId = formData.get("userId") as string;
    const oldPhotoUrl = (formData.get("oldPhotoUrl") as string) || "";

    let photoUrl;
    if (files.length > 0 && files[0] instanceof File) {
      const photoName = dateName(files[0]);
      const Body = (await files[0]?.arrayBuffer()) as Buffer;
      photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/temp/${photoName}`;
      AWS_S3.send(
        new PutObjectCommand({
          Bucket: `${AWS_BUCKET}`,
          Key: `temp/${photoName}`, // 저장시 넣고 싶은 파일 이름
          Body,
          ContentType: "image/jpg",
        }),
      );

      const urlParts = oldPhotoUrl?.split("/");
      const fileName = urlParts?.[urlParts?.length - 1]; // 경로의 마지막 부분이 파일 이름

      AWS_S3.send(
        new DeleteObjectCommand({
          Bucket: `${AWS_BUCKET}`,
          Key: `temp/${fileName}`,
        }),
      );
    } else {
      photoUrl = formData.get("photo") as string;
    }
    // 유저 정보 수정
    const isSuccess = await updateUser(name, photoUrl, userId);

    if (!isSuccess) {
      return new NextResponse("Internal Error", { status: 500 });
    }

    const fetchedUser = await getUserInfo(userId);
    const newToken = generateJWT(fetchedUser);

    const response = NextResponse.json(
      { success: true, token: newToken, data: fetchedUser },
      { status: 200 },
    );

    response.cookies.set("chat-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;
    // if (newUser) {
    // const fetchedUser = await getUserInfo(userId);
    //   return NextResponse.json({ data: fetchedUser, success: true }); // Created
    // }
  } catch (error) {
    console.error("Error processing PATCH request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
