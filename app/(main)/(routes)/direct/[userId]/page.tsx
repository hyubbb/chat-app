import { DirectRoom } from "@/components/direct/direct-room";

export const metadata = {
  title: "Chat page",
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
