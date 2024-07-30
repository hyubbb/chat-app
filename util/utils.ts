import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dateFormatted = (dbTime: string) => {
  const date = new Date(dbTime);
  const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  return formattedDate;
};



export  const useInput = (initialValue:string) =>{
  // const [value, setValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  const reset = () => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
  };

  return {
    value,
    setValue,
    onChange: handleChange,
    debouncedValue, // 디바운스된 값을 반환
    reset,
  };
}
