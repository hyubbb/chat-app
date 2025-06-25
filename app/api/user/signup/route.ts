import { checkUserExists, createUser } from "@/lib/service/service";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { dateName } from "@/util/utils";

// 사용자 생성
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("photo") as any;
    const id = formData.get("id");
    const name = formData.get("userName");
    const password = formData.get("password");

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 }, // Bad Request
      );
    }
    // ID 중복 체크
    const userExists = await checkUserExists(id);
    if (userExists) {
      return NextResponse.json(
        { success: false },
        { status: 409 }, // Conflict
      );
    }

    let photoUrl;
    if (files.length > 0 && files[0] instanceof File) {
      const photoName = dateName(files[0]);
      const arrayBuffer = await files[0]?.arrayBuffer();
      const Body = Buffer.from(arrayBuffer as unknown as ArrayBuffer);
      photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/temp/${photoName}`;
      await AWS_S3.send(
        new PutObjectCommand({
          Bucket: `${AWS_BUCKET}`,
          Key: `temp/${photoName}`, // 저장시 넣고 싶은 파일 이름
          Body,
          ContentType: "image/jpg",
        }),
      );
    } else {
      photoUrl = formData.get("photo") as string;
    }
    // 사용자 생성
    const res = await createUser(id, name, password, photoUrl);
    return NextResponse.json(
      { success: true, type: "new", data: res },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error getting user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
