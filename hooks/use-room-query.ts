import { useQuery } from "@tanstack/react-query";
import { CategoriesType, RoomsType } from "@/types";
import { getAllRooms } from "@/lib/service/service";

export const useRoomQuery = ({
  categories,
  userId,
}: {
  categories?: CategoriesType | null;
  userId?: number | null;
}) => {
  const getJoinRoom = async () => {
    try {
      const response = await fetch(`/api/socket/user/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data: joinRoomData,
    isError: isJoinRoomError,
    isLoading: isJoinRoomLoading,
  } = useQuery({
    queryKey: ["joinRoomList"],
    queryFn: getJoinRoom,
    enabled: !!userId,
  });

  const getRooms = async () => {
    const response = await fetch(`/api/room`);
    const data = await response.json();
    return data;
  };

  const {
    data: roomsData,
    isError: isRoomsError,
    isLoading: isRoomsLoading,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  return {
    joinRoomData,
    isJoinRoomError,
    isJoinRoomLoading,
    roomsData,
    isRoomsError,
    isRoomsLoading,
  };
};
