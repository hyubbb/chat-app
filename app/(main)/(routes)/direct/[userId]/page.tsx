import { DirectRoom } from "@/app/(main)/(routes)/direct/_components/direct-room";

export const metadata = {
  title: "DIRECT CHAT",
};

type DirectMessagePageProps = {
  params: {
    userId: number;
  };
};

const DirectMessagePage = async ({ params }: DirectMessagePageProps) => {
  return <DirectRoom chatId={+params.userId} />;
};
export default DirectMessagePage;
