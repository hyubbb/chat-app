"use client";

import axios from "axios";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormType } from "@/types";
import { Toast } from "@/components/ui/toast";
import { useToastStore } from "@/store/use-toast-store";
import { useAlertModal } from "@/store/use-alert-modal";
import { useConfirmStore } from "@/store/use-confirm-store";

interface SubmitProps {
  data: useFormType;
  isEdit: boolean;
  userPhotoUrl?: string | null;
}

/**
 * 폼 데이터를 서버에 제출하는 함수
 */
const submitFormData = async ({ data, isEdit, userPhotoUrl }: SubmitProps) => {
  const formData = new FormData();

  // 사진 처리
  if (typeof data.photo === "string") {
    formData.append("photo", data.photo);
  } else if (data.photo && data.photo.length > 0) {
    formData.append("photo", data.photo[0]);
    formData.append("oldPhotoUrl", userPhotoUrl || "");
  }

  // 기본 데이터 추가
  formData.append("userId", data.userId?.toString() || "");
  formData.append("userName", data.userName);

  // 회원가입 또는 프로필 수정에 따른 처리
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

/**
 * 회원가입 및 프로필 수정 제출을 관리하는 커스텀 훅
 * @param setIsEditModalOpen 모달 상태 변경 함수
 * @param setPreviewUrl 프로필 이미지 미리보기 URL 설정 함수
 * @param userPhotoUrl 기존 사용자 프로필 이미지 URL
 */
export const useSignUpSubmit = (
  setIsEditModalOpen: (isOpen: boolean) => void,
  setPreviewUrl: (url: string | null) => void,
  userPhotoUrl?: string | null,
) => {
  const queryClient = useQueryClient();
  const alertModal = useAlertModal();
  const { showConfirm } = useConfirmStore();

  // 폼 제출 뮤테이션
  const mutation = useMutation({
    mutationFn: submitFormData,
    onSuccess: ({ data }) => {
      const { success, data: userData, type } = data;

      if (!success) {
        throw new Error("중복된 아이디입니다. 다른 아이디를 사용해주세요.");
      }

      // 프로필 수정인 경우 사용자 데이터 업데이트
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
      // 에러 발생 시 사용자에게 알림
      alert("오류가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
    },
  });

  /**
   * 폼 제출 핸들러
   * @param data 폼 데이터
   * @param reset 폼 초기화 함수
   * @param isEdit 수정 모드 여부
   */
  const onSubmit = useCallback(
    async (data: useFormType, reset: () => void, isEdit: boolean = false) => {
      try {
        const { data: result } = await mutation.mutateAsync({
          data,
          isEdit,
          userPhotoUrl,
        });

        if (result.success) {
          // 성공 시 폼 초기화 및 모달 닫기
          reset();
          setIsEditModalOpen(false);
          setPreviewUrl(null);

          // 성공 메시지 표시
          if (result.type === "new") {
            alertModal.open({
              title: "회원가입 완료",
              description: "회원가입이 완료되었습니다.",
              confirmLabel: "확인",
              onConfirm: () => {
                window.location.href = "/login";
              },
            });
          } else {
            alertModal.open({
              title: "수정 완료",
              description: "회원정보가 수정되었습니다.",
              confirmLabel: "확인",
              onConfirm: () => {
                window.location.reload();
              },
            });
          }
        }
      } catch (error) {
        // 에러 처리
        if (error instanceof Error) {
          alertModal.open({
            title: "오류",
            description: error.message,
            confirmLabel: "확인",
          });
        } else {
          alertModal.open({
            title: "오류",
            description: "오류가 발생했습니다. 새로고침 후 다시 시도해 주세요!",
            confirmLabel: "확인",
          });
        }
      }
    },
    [mutation, setIsEditModalOpen, setPreviewUrl, userPhotoUrl, alertModal],
  );

  /**
   * 파일 변경 핸들러 - 이미지 미리보기 처리
   * @param event 파일 입력 이벤트
   */
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

  return { onSubmit, handleFileChange, isLoading: mutation.isPending };
};
