import { UserType } from "@/types";

export const withAuthComponent = (
  LoginComponent: React.ComponentType,
  LogoutComponent: React.ComponentType<{ user: UserType }>,
) => {
  return ({ user }: { user: UserType | null }) => {
    // user데이터의 유무를 확인하여 로그인 컴포넌트를 반환
    if (user && user.id) {
      // 로그아웃 컴포넌트를 반환
      return <LogoutComponent user={user} />;
    }
    // 로그인 컴포넌트를 반환
    return <LoginComponent />;
  };
};
