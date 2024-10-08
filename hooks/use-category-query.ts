import { CategoriesType, UserType } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 *
 * @description 카테고리 정보를 가져오는 API를 호출하여 데이터를 가져옴
 * 초기 데이터를 받아와서 캐시에 저장
 */
export const useCategoryQuery = ({
  initCategories,
}: {
  initCategories: CategoriesType[];
}) => {
  const queryClient = useQueryClient();

  const categoryApi = async (): Promise<CategoriesType[]> => {
    // 카테고리 리스트와 각 카테고리의 rooms 데이터를 가져옴
    const { data } = await axios.get<CategoriesType[]>(`/api/category`);
    queryClient.setQueryData(["categoryList"], data);
    // 각 카테고리별로 rooms 데이터를 캐시에 저장
    data.forEach(({ category_id, rooms }) => {
      queryClient.setQueryData(["categoryRooms", category_id], rooms);
    });

    return data;
  };

  const { data, isError, isLoading, error } = useQuery<CategoriesType[], Error>(
    {
      queryKey: ["categoryList"],
      initialData: initCategories || [],
      queryFn: categoryApi,
    },
  );

  return { data, isError, isLoading, error };
};
