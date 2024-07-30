import { RoomList } from "@/components/room/room-list";

export const metadata = {
  title: "Home",
};

const HomePage = async () => {
  return (
    <>
      <RoomList />
    </>
  );
};
export default HomePage;
