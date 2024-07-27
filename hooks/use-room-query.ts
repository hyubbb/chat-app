
import {  useQuery } from "@tanstack/react-query";
import { useSocketStore } from "./use-store";

export const useRoomQuery = ({
  categoryId,
  userId,
}: {
  categoryId?: number;
  userId?: number;
}) => {
  const { isConnected } = useSocketStore();

  const {
    data: categoryData,
    isError: isCategoryError,
    isLoading: isCategoryLoading,
  } = useQuery({
    queryKey: ["categoryRooms", categoryId],
  });

  const getJoinRoom = async () => {
    try {
      const response = await fetch(`/api/socket/user/${userId}`);
      const data = await response.json();
      // setSelected=data[0];
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

  return {
    categoryData,
    isCategoryError,
    isCategoryLoading,
    joinRoomData,
    isJoinRoomError,
    isJoinRoomLoading,
  };
};
