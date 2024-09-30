import React from "react";
import { CategoriesType } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";

type SideMenuCategoryProps = {
  toggleCollapse: (key: string) => void;
  collapseState: any;
  categories: CategoriesType[];
  handleCategoryClick: (category: CategoriesType) => void;
  selected: CategoriesType | null;
};

export const SideMenuCategory = ({
  toggleCollapse,
  collapseState,
  categories,
  handleCategoryClick,
  selected,
}: SideMenuCategoryProps) => {
  return (
    <>
      <div
        className="mb-2 flex cursor-pointer items-center justify-between overflow-y-scroll"
        onClick={() => toggleCollapse("room")}
      >
        <div className="flex w-full items-center gap-x-2">
          <h3 className="text-sm font-medium text-gray-500">전체 채팅방</h3>
          {categories?.length > 0 && (
            <span className="m-0 p-0 text-xs text-gray-400">
              ({categories?.length})
            </span>
          )}
        </div>

        <div className="mr-2">
          {collapseState.room ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </div>
      {!collapseState.room && (
        <ul className="space-y-1">
          {categories?.map((category: CategoriesType) => (
            <li
              key={category?.category_name}
              className={`flex cursor-pointer items-center justify-between rounded p-2 text-sm hover:bg-gray-300 dark:hover:text-zinc-800 ${selected?.category_id === category?.category_id ? "bg-blue-300 text-zinc-800" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              <span>{category?.category_name}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-700">
                {category?.rooms.length}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
