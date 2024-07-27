import { RoomList } from "@/components/room/room-list";

export const metadata = {
  title: "Home",
};

const fetchRooms = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/socket/chat`,
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  }
};

const HomePage = async () => {
  // const roomsData = await fetchRooms();
  // console.log(roomsData);
  return (
    <>
      <RoomList />
      {/* <Header />
      <ChatList roomsData={roomsData} /> */}
    </>
  );
};
export default HomePage;
