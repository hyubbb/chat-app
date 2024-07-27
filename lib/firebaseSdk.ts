import * as admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import { Auth, getAuth } from "firebase/auth";
import { setCookie } from "nookies";

const firebaseAdminConfig = {
  private_key:
    (process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY_ID as string).replace(
      /\\n/g,
      "\n",
    ) || undefined,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASEURL,
  });
}

// ID 토큰 검증 함수
const verifyIdToken = async (token: string) => {
  if (!token) return null;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    if (error.code === "auth/id-token-expired") {
      // 토큰이 만료되었음을 나타내는 사용자 정의 에러를 throw
      // throw new Error("TOKEN_EXPIRED");
      console.log(`[TOKEN EXPIRED]: ${error.message}`);
      // await getRefreshedToken();
    }
    // throw error;
    console.log(`[TOKEN_EXPIRED]: ${error.message}`);
    return null;
  }
};

export async function getUser(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return await admin.auth().getUser(decodedToken.uid);
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

// 새로운 토큰 얻기 (클라이언트 측)
export const getRefreshedToken = async () => {
  const auth: Auth = getAuth();
  console.log("[getRefreshedToken]");
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken(true);
      console.log("New token obtained:", token);
      setCookie(null, "auth_token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  } else {
    throw new Error("No current user");
  }
};

export { verifyIdToken, admin as firebaseAdmin };
