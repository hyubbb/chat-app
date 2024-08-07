import { useQuery } from "@tanstack/react-query";
import { CategoriesType, RoomsType } from "@/types";

export const useRoomQuery = ({
  categories,
  userId,
}: {
  categories?: CategoriesType | null;
  userId?: number | null;
}) => {
  const {
    data: categoryData,
    isError: isCategoryError,
    isLoading: isCategoryLoading,
  } = useQuery<RoomsType[]>({
    queryKey: ["categoryRooms", categories?.category_id],
  });

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

  return {
    categoryData,
    isCategoryError,
    isCategoryLoading,
    joinRoomData,
    isJoinRoomError,
    isJoinRoomLoading,
  };
};
