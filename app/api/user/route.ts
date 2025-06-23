import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserType } from "@/types";
import { dateName } from "@/util/utils";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getUserInfo, updateUser } from "@/lib/service/service";
import { handleRefreshToken } from "@/app/actions/actions";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET as string;
const generateJWT = (user: UserType) => {
  const payload = { ...user };

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1m", // 15분
  });
};

// 처음 웹페이지에 접근했을때, 토큰값을 확인한 후, 사용자 정보 가져오기
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access-token")?.value;
  // 액세스 토큰만 확인
  if (!accessToken) {
    return handleRefreshToken();
  }

  try {
    // 액세스 토큰 검증
    const user = jwt.verify(accessToken, SECRET_KEY) as UserType;
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // 액세스 토큰이 만료된 경우에만 리프레시 토큰 사용
      return handleRefreshToken();
    }
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
// 사용자 정보 수정
export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photo") as any;
    const name = formData.get("userName") as string;
    const userId = formData.get("userId") as string;
    const oldPhotoUrl = (formData.get("oldPhotoUrl") as string) || "";

    let photoUrl;
    if (files.length > 0 && typeof files[0]?.arrayBuffer === "function") {
      const photoName = dateName(files[0]);
      const arrayBuffer = await files[0]?.arrayBuffer();
      const Body = Buffer.from(arrayBuffer);
      photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/temp/${photoName}`;
      await AWS_S3.send(
        new PutObjectCommand({
          Bucket: `${AWS_BUCKET}`,
          Key: `temp/${photoName}`, // 저장시 넣고 싶은 파일 이름
          Body,
          ContentType: "image/jpg",
        }),
      );

      const urlParts = oldPhotoUrl?.split("/");
      const fileName = urlParts?.[urlParts?.length - 1]; // 경로의 마지막 부분이 파일 이름

      await AWS_S3.send(
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

    response.cookies.set("access-token", newToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 1 * 60, // 15분
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error processing PATCH request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
