import axios from "axios";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormType } from "@/types";

interface SubmitProps {
  data: useFormType;
  reset: () => void;
  setIsSignUpModalOpen: (isOpen: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  isEdit: boolean;
}

const submitFormData = async ({
  data,
  isEdit,
  userPhotoUrl,
}: {
  data: useFormType;
  isEdit: boolean;
  userPhotoUrl?: string | null;
}) => {
  const formData = new FormData();

  if (typeof data.photo === "string") {
    formData.append("photo", data.photo);
  } else if (data.photo && data.photo.length > 0) {
    formData.append("photo", data.photo[0]);
    formData.append("oldPhotoUrl", userPhotoUrl || "");
  }
  formData.append("userId", data.userId + "");
  formData.append("userName", data.userName);
  if (!isEdit) {
    formData.append("id", data.id);
    formData.append("password", data.password);
    return await axios.post(`/api/user/signup`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    return await axios.patch(`/api/user`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};

export const useSignUpSubmit = (
  setIsEditModalOpen: (isOpen: boolean) => void,
  setPreviewUrl: (url: string | null) => void,
  userPhotoUrl?: string | null,
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: ({ data }) => {
      const { success, data: userData, type } = data;
      if (!success) {
        throw new Error("중복된 아이디입니다. 다른 아이디를 사용해주세요.");
      }

      if (type !== "new") {
        queryClient.setQueryData(["user"], userData);
      }
      return { success, type };
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      }
      alert("오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
    },
  });

  const onSubmit = useCallback(
    async (data: useFormType, reset: () => void, isEdit: boolean = false) => {
      try {
        const result = await mutation.mutateAsync({
          data,
          isEdit,
          userPhotoUrl,
        });
        if (result.data.success) {
          reset();
          setIsEditModalOpen(false);
          setPreviewUrl(null);

          if (result.data.type === "new") {
            alert("회원가입이 완료되었습니다.");
          } else {
            alert("사용자 정보가 업데이트되었습니다.");
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("오류가 발생했습니다. 새로고침 후 다시 시도해 주세요!");
        }
      }
    },
    [mutation, setIsEditModalOpen, setPreviewUrl],
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result && typeof e.target.result === "string") {
            setPreviewUrl(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    },
    [setPreviewUrl],
  );

  return { onSubmit, handleFileChange };
};
