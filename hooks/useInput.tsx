import { useEffect, useState } from "react";

export const useInput = (initialValue: string) => {
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
};
