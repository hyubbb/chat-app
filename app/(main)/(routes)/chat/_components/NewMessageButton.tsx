import React from "react";

const NewMessageButton = ({
  containerWidth,
  handleAlertClick,
}: {
  containerWidth: number;
  handleAlertClick: () => void;
}) => {
  const buttonWidth = 170;
  const menuWidth = containerWidth < 640 ? 0 : 255;

  return (
    <div
      className="fixed bottom-3 z-10 flex w-full"
      style={{
        maxWidth: containerWidth ? `${containerWidth - menuWidth}px` : "auto",
        left: `calc( ${menuWidth}px + ( 100% - ${menuWidth}px )/2 - ${buttonWidth}px / 2 )`,
        bottom: "80px",
      }}
    >
      <button
        onClick={handleAlertClick}
        className="h-[40px] rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg transition hover:bg-blue-600"
      >
        ⬇ 새로운 메시지 보기
      </button>
    </div>
  );
};

export default NewMessageButton;
