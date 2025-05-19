"use client";

import { CategoriesType } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback } from "react";

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

  // 카테고리 API 호출 함수
  const categoryApi = useCallback(async (): Promise<CategoriesType[]> => {
    try {
      // 카테고리 리스트와 각 카테고리의 rooms 데이터를 가져옴
      const { data } = await axios.get<CategoriesType[]>(`/api/category`);

      // 전체 카테고리 리스트 캐시에 저장
      queryClient.setQueryData(["categoryList"], data);

      // 각 카테고리별로 rooms 데이터를 캐시에 저장
      data.forEach(({ category_id, rooms }) => {
        queryClient.setQueryData(["categoryRooms", category_id], rooms);
      });

      return data;
    } catch (error) {
      console.error("카테고리 데이터 가져오기 실패:", error);
      throw error; // React Query의 에러 핸들링을 위해 에러를 다시 던짐
    }
  }, [queryClient]);

  // 카테고리 데이터 쿼리
  const { data, isError, isLoading, error } = useQuery<CategoriesType[], Error>(
    {
      queryKey: ["categoryList"],
      initialData: initCategories || [],
      queryFn: categoryApi,
    },
  );

  return { data, isError, isLoading, error };
};
