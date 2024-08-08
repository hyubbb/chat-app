import { RoomList } from "@/components/room/room-list";

export const metadata = {
  title: "WELCOME CHAT APP",
};

const HomePage = async () => {
  return (
    <>
      <RoomList />
    </>
  );
};
export default HomePage;
