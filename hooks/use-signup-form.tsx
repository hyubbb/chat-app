import { useFormType } from "@/types";
import { useForm } from "react-hook-form";

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
};

type ValidationRules = {
  [field: string]: FieldValidationRule;
};

// 유효성 검사 규칙
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
    // pattern: {
    //   value:
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   message: "비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.",
    // },
  },
};

// 커스텀 훅
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

  const registerField = (name: any) => register(name, validationRules[name]);

  return {
    register: registerField,
    handleSubmit,
    errors,
    reset,
    watch,
  };
};
