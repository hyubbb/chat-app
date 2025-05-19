"use client";

import { useFormType } from "@/types";
import { useForm } from "react-hook-form";

/**
 * 폼 필드 유효성 검사 규칙 타입
 */
type FieldValidationRule = {
  required?: string;
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
  pattern?: {
    value: RegExp;
    message: string;
  };
  validate?: Record<string, (value: any) => boolean | string>;
};

/**
 * 모든 폼 필드에 대한 유효성 검사 규칙
 */
type ValidationRules = {
  [field: string]: FieldValidationRule;
};

/**
 * 회원가입 폼 유효성 검사 규칙
 */
const validationRules: ValidationRules = {
  id: {
    required: "아이디를 입력해주세요.",
    minLength: {
      value: 4,
      message: "아이디는 최소 4자 이상이어야 합니다.",
    },
    maxLength: {
      value: 20,
      message: "아이디는 최대 20자까지 가능합니다.",
    },
    pattern: {
      value: /^[a-z0-9_-]+$/,
      message: "아이디는 영문 소문자, 숫자, 밑줄, 하이픈만 사용 가능합니다.",
    },
  },
  userName: {
    required: "닉네임을 입력해주세요.",
    minLength: {
      value: 3,
      message: "닉네임은 최소 3자 이상이어야 합니다.",
    },
    maxLength: {
      value: 20,
      message: "닉네임은 최대 20자까지 가능합니다.",
    },
  },
  password: {
    required: "비밀번호를 입력해주세요.",
    minLength: {
      value: 4,
      message: "비밀번호는 최소 4자 이상이어야 합니다.",
    },
    // 필요시 주석 해제하여 복잡한 비밀번호 규칙 적용
    // pattern: {
    //   value:
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   message: "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.",
    // },
  },
  photo: {
    validate: {
      fileType: (value: any) => {
        if (!value || value.length === 0) return true;
        if (typeof value === "string") return true;

        const file = value[0];
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        return (
          allowedTypes.includes(file.type) ||
          "이미지 파일만 업로드 가능합니다. (jpeg, png, gif, webp)"
        );
      },
      fileSize: (value: any) => {
        if (!value || value.length === 0) return true;
        if (typeof value === "string") return true;

        const file = value[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize || "파일 크기는 5MB 이하만 가능합니다.";
      },
    },
  },
};

/**
 * 회원가입 및 프로필 수정 폼을 관리하는 커스텀 훅
 * @returns 폼 제어를 위한 메서드들과 상태
 */
export const useSignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<useFormType>({
    defaultValues: {
      id: "",
      userName: "",
      password: "",
      photo: null,
    },
  });

  /**
   * 특정 필드에 대한 유효성 검사 규칙이 적용된 register 함수 반환
   * @param name 폼 필드 이름
   * @returns register 함수 반환값
   */
  const registerField = (name: keyof useFormType) =>
    register(name, validationRules[name as keyof typeof validationRules]);

  return {
    register: registerField,
    handleSubmit,
    errors,
    reset,
    watch,
  };
};
