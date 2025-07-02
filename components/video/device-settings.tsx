import { useEffect, useState } from "react";
import { useVideoStore } from "@/store/use-video-store";
import { useToastStore } from "@/store/use-toast-store";
import { LucideLoader2 } from "lucide-react";

interface DeviceSettingsProps {
  onDeviceChange?: (deviceId: string, type: "video" | "audio") => Promise<void>;
  onClose?: () => void;
}

export const DeviceSettings = ({
  onDeviceChange,
  onClose,
}: DeviceSettingsProps) => {
  const {
    selectedVideoDevice,
    selectedAudioDevice,
    availableVideoDevices,
    availableAudioDevices,
    setAvailableDevices,
  } = useVideoStore();
  const { showToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);

  // 사용 가능한 디바이스 목록 가져오기
  const loadAvailableDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput",
      );

      setAvailableDevices({
        videoDevices,
        audioDevices,
      });
    } catch (error) {
      console.error("디바이스 목록 조회 실패:", error);
      showToast("디바이스 목록을 가져올 수 없습니다.", "error", 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 디바이스 변경 처리
  const handleDeviceChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    type: "video" | "audio",
  ) => {
    const deviceId = event.target.value;
    try {
      setIsLoading(true);
      await onDeviceChange?.(deviceId, type);
      showToast(
        `${type === "video" ? "카메라" : "마이크"} 설정이 변경되었습니다.`,
        "success",
        3000,
      );
    } catch (error) {
      console.error("디바이스 변경 실패:", error);
      showToast(
        `${type === "video" ? "카메라" : "마이크"} 변경에 실패했습니다.`,
        "error",
        3000,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 디바이스 변경 감지
  useEffect(() => {
    loadAvailableDevices();

    // 디바이스 변경 이벤트 리스너
    const handleDeviceChange = () => {
      loadAvailableDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LucideLoader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">장치 설정</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="videoDevice"
            className="block text-sm font-medium text-gray-700"
          >
            카메라
          </label>
          <select
            id="videoDevice"
            value={selectedVideoDevice || ""}
            onChange={(e) => handleDeviceChange(e, "video")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">기본 카메라</option>
            {availableVideoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `카메라 ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="audioDevice"
            className="block text-sm font-medium text-gray-700"
          >
            마이크
          </label>
          <select
            id="audioDevice"
            value={selectedAudioDevice || ""}
            onChange={(e) => handleDeviceChange(e, "audio")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">기본 마이크</option>
            {availableAudioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `마이크 ${device.deviceId.slice(0, 8)}...`}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          * 디바이스를 변경하면 통화 품질에 일시적인 영향이 있을 수 있습니다.
        </div>
      </div>
    </div>
  );
};
