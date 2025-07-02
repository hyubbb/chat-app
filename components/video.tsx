import { useStore } from "@/store/use-store";
import { useToastStore } from "@/store/use-toast-store";
import { useVideoStore } from "@/store/use-video-store";
import { dmListType } from "@/types";
import { logger } from "@/lib/logger";
import {
  LucideVideo,
  LucideVideoOff,
  LucideMic,
  LucideMicOff,
  LucidePhone,
  LucidePhoneOff,
  LucideMaximize2,
  LucideMinimize2,
  LucideUsers,
  LucideSettings,
  LucideLoader2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useVideoCall } from "@/hooks/use-video-call";
import { DeviceSettings } from "./video/device-settings";

// 소켓 이벤트 타입 정의
interface OfferPayload {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
  userId: number;
  userName: string;
}

interface AnswerPayload {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
}

interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
  roomId: string;
}

interface CallRejectedPayload {
  roomId: string;
  reason?: string;
}

interface CallEndedPayload {
  roomId: string;
}

interface PeerDisconnectedPayload {
  roomId: string;
}

interface ScreenSharePayload {
  roomId: string;
}

interface VideoProps {
  dmInfo: dmListType | null;
}

// 통화 요청/응답 UI 컴포넌트
const CallRequestUI = ({
  status,
  dmInfo,
  onAccept,
  onReject,
}: {
  status: string;
  dmInfo: dmListType | null;
  onAccept: () => void;
  onReject: () => void;
}) => {
  if (status !== "requesting" && status !== "incoming") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
        <div className="flex flex-col items-center justify-center text-center">
          {status === "requesting" ? (
            <>
              <h3 className="mb-2 text-lg font-semibold">통화 연결 중</h3>
              <p className="mb-4 text-gray-600">
                {dmInfo?.other_name}님에게 통화를 요청했습니다.
              </p>
              <LucideLoader2 className="animate-spin" />
              <button
                onClick={onReject}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <h3 className="mb-2 text-lg font-semibold">수신 통화</h3>
              <p className="mb-4 text-gray-600">
                {dmInfo?.other_name}님이 통화를 요청했습니다.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onAccept}
                  className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  수락
                </button>
                <button
                  onClick={onReject}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  거절
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 비디오 컨트롤 UI 컴포넌트
const VideoControls = ({
  isVideoEnabled,
  isAudioEnabled,
  isFullscreen,
  showDeviceSettings,
  onToggleVideo,
  onToggleAudio,
  onToggleFullscreen,
  onToggleDeviceSettings,
  onEndCall,
}: {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isFullscreen: boolean;
  showDeviceSettings: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleFullscreen: () => void;
  onToggleDeviceSettings: () => void;
  onEndCall: () => void;
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4 rounded-full bg-black/50 p-3">
      <button
        onClick={onToggleVideo}
        className={`rounded-full p-2 ${isVideoEnabled ? "bg-gray-700" : "bg-red-500"}`}
      >
        {isVideoEnabled ? <LucideVideo /> : <LucideVideoOff />}
      </button>
      <button
        onClick={onToggleAudio}
        className={`rounded-full p-2 ${isAudioEnabled ? "bg-gray-700" : "bg-red-500"}`}
      >
        {isAudioEnabled ? <LucideMic /> : <LucideMicOff />}
      </button>
      <button
        onClick={onEndCall}
        className="rounded-full bg-red-500 p-2 hover:bg-red-600"
      >
        <LucidePhoneOff />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="rounded-full bg-gray-700 p-2"
      >
        {isFullscreen ? <LucideMinimize2 /> : <LucideMaximize2 />}
      </button>
      <button
        onClick={onToggleDeviceSettings}
        className="rounded-full bg-gray-700 p-2"
      >
        <LucideSettings />
      </button>
    </div>
  );
};

// 메인 비디오 컴포넌트
export const Video = ({ dmInfo }: VideoProps) => {
  const { socket, isConnected } = useStore();
  const { showToast } = useToastStore();
  const {
    status,
    isVideoEnabled,
    isAudioEnabled,
    isFullscreen,
    participants,
    error,
    selectedVideoDevice,
    selectedAudioDevice,
    availableVideoDevices,
    availableAudioDevices,
    setStatus,
    setVideoEnabled,
    setAudioEnabled,
    setFullscreen,
    setParticipants,
    setError,
    setCallInfo,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    reset,
    setAvailableDevices,
  } = useVideoStore();

  const {
    localVideoRef,
    remoteVideoRef,
    initializeMedia,
    handleCallRequest,
    handleAcceptCall,
    handleDeviceChange,
    rejectCall,
    endCall,
  } = useVideoCall(dmInfo);

  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // 디바이스 변경 핸들러 - useVideoCall의 함수를 래핑
  const onDeviceChange = async (deviceId: string, type: "video" | "audio") => {
    try {
      await handleDeviceChange(deviceId, type);

      // 스토어 상태 업데이트
      if (type === "video") {
        setSelectedVideoDevice(deviceId);
      } else {
        setSelectedAudioDevice(deviceId);
      }

      showToast(
        `${type === "video" ? "카메라" : "마이크"} 설정이 변경되었습니다.`,
        "success",
        3000,
      );
    } catch (error) {
      console.error("디바이스 변경 실패:", error);
      showToast("디바이스 변경에 실패했습니다.", "error", 3000);
    }
  };

  // 통화 시작 버튼
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={async () => {
            try {
              await initializeMedia();
              await handleCallRequest();
            } catch (error) {
              console.error("통화 시작 실패:", error);
              showToast("통화 시작에 실패했습니다.", "error", 3000);
              setStatus("idle");
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="영상통화 시작"
        >
          <LucideVideo className="h-5 w-5" />
        </button>
      </div>
    );
  }

  // 비디오 화면 (requesting, incoming, connecting, connected 등)
  const showVideoScreen = [
    "requesting",
    "incoming",
    "connecting",
    "connected",
    "reconnecting",
  ].includes(status);

  if (!showVideoScreen) {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-gray-900">
      {/* 통화 요청/응답 UI */}
      <CallRequestUI
        status={status}
        dmInfo={dmInfo}
        onAccept={handleAcceptCall}
        onReject={rejectCall}
      />

      {/* 비디오 그리드 */}
      <div className="grid h-full w-full grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* 로컬 비디오 */}
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-800 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1 text-sm text-white">
            나
          </div>
        </div>

        {/* 리모트 비디오 */}
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-800 shadow-lg">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1 text-sm text-white">
            {dmInfo?.other_name || "상대방"}
          </div>
        </div>
      </div>

      {/* 비디오 컨트롤 - 화면 중앙 하단에 배치 */}
      {status === "connected" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
          <VideoControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isFullscreen={isFullscreen}
            showDeviceSettings={showDeviceSettings}
            onToggleVideo={async () => {
              setVideoEnabled(!isVideoEnabled);
              const stream = localVideoRef.current?.srcObject as MediaStream;
              if (stream) {
                stream.getVideoTracks().forEach((track) => {
                  track.enabled = !isVideoEnabled;
                });
              }
            }}
            onToggleAudio={() => {
              setAudioEnabled(!isAudioEnabled);
              const stream = localVideoRef.current?.srcObject as MediaStream;
              if (stream) {
                stream.getAudioTracks().forEach((track) => {
                  track.enabled = !isAudioEnabled;
                });
              }
            }}
            onToggleFullscreen={() => {
              if (!videoContainerRef.current) return;
              if (!document.fullscreenElement) {
                videoContainerRef.current.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
              setFullscreen(!isFullscreen);
            }}
            onToggleDeviceSettings={() =>
              setShowDeviceSettings(!showDeviceSettings)
            }
            onEndCall={endCall}
          />
        </div>
      )}

      {/* 장치 설정 */}
      {showDeviceSettings && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <DeviceSettings
            onDeviceChange={onDeviceChange}
            onClose={() => setShowDeviceSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Video;
