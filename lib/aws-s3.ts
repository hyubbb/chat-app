import { S3Client } from "@aws-sdk/client-s3";

export const AWS_BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
export const AWS_S3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
  },
});
