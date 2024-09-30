import React, { useState, useEffect, useCallback } from "react";
import { X, Plus } from "lucide-react";
import { CategoriesType, RoomsType, UserType } from "@/types";
import axios from "axios";

type RoomCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoriesType[];
  user: UserType | null;
};

export const RoomCreateModal = ({
  isOpen,
  onClose,
  categories,
  user,
}: RoomCreateModalProps) => {
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [allRoomsData, setAllRoomsData] = useState<RoomsType[]>([]);

  // 전체의 채팅방 데이터를 가져옴, 채팅방 이름이 중복되는지 확인하기 위해서
  useEffect(() => {
    if (!categories) return;
    categories?.map(({ rooms }) => {
      return setAllRoomsData((prev) => [...prev, ...rooms]);
    });
  }, [categories]);

  const clearForm = useCallback(() => {
    setRoomTitle("");
    setSelectedCategory("");
    setNewCategory("");
    setIsNewCategory(false);
  }, []);

  // 카테고리명 중복 확인
  const isDuplicateCategory = useCallback(
    (category: string) =>
      categories.some(({ category_name }) => category_name === category),
    [categories],
  );

  // 채팅방 이름 중복 확인
  const isDuplicateRoom = useCallback(
    (room: string) => {
      return allRoomsData.some(({ room_name }) => room_name == room);
    },

    [allRoomsData],
  );

  const fetchRoomPost = useCallback(
    async (title: any, categoryName: any) => {
      // 새 채팅방 생성 로직
      await axios.post("/api/socket/chat", {
        categoryName,
        roomName: title,
        userId: user?.user_id || null,
      });
    },
    [user],
  );

  const handleCreateRoom = useCallback(() => {
    const category = isNewCategory ? newCategory : selectedCategory;

    // 카테고리명 또는 채팅방 이름이 중복되는지 확인
    if (isDuplicateCategory(category) || isDuplicateRoom(roomTitle)) {
      alert("중복된 카테고리 또는 채팅방 이름입니다.");
      return;
    }

    fetchRoomPost(roomTitle, category);
    clearForm();
    onClose();
  }, [
    roomTitle,
    selectedCategory,
    newCategory,
    isNewCategory,
    isDuplicateCategory,
    isDuplicateRoom,
    fetchRoomPost,
    clearForm,
    onClose,
  ]);

  const handleClose = () => {
    clearForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            새 채팅방 만들기
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label
              htmlFor="roomTitle"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              채팅방 제목
            </label>
            <input
              type="text"
              id="roomTitle"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="채팅방 제목을 입력하세요"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              카테고리
            </label>
            {isNewCategory ? (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="새 카테고리 이름"
              />
            ) : (
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">카테고리 선택</option>
                {categories?.map((category: CategoriesType) => (
                  <option
                    key={category.category_id}
                    value={category.category_name}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => setIsNewCategory(!isNewCategory)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus size={16} className="mr-1" />
            {isNewCategory ? "기존 카테고리 선택" : "새 카테고리 만들기"}
          </button>
          <div className="flex justify-end">
            <button
              onClick={handleCreateRoom}
              disabled={!roomTitle || (!selectedCategory && !newCategory)}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              채팅방 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
