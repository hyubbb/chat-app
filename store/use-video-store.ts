import { create } from "zustand";

export type VideoCallStatus =
  | "idle" // 초기 상태
  | "requesting" // 통화 요청 중
  | "incoming" // 수신 통화
  | "connecting" // 연결 중
  | "connected" // 연결됨
  | "reconnecting" // 재연결 중
  | "failed" // 연결 실패
  | "rejected" // 통화 거절됨
  | "ended"; // 통화 종료

interface VideoCallState {
  // 통화 상태
  status: VideoCallStatus;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isFullscreen: boolean;
  participants: number;
  error: string | null;

  // 통화 정보
  roomId: string | null;
  roomName: string | null;
  callerId: number | null;
  callerName: string | null;

  // 미디어 설정
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  availableVideoDevices: MediaDeviceInfo[];
  availableAudioDevices: MediaDeviceInfo[];

  // 상태 변경 함수
  setStatus: (status: VideoCallStatus) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setFullscreen: (enabled: boolean) => void;
  setParticipants: (count: number) => void;
  setError: (error: string | null) => void;

  // 통화 정보 설정
  setCallInfo: (info: {
    roomId: string;
    roomName: string;
    callerId: number;
    callerName: string;
  }) => void;

  // 미디어 설정
  setSelectedVideoDevice: (deviceId: string | null) => void;
  setSelectedAudioDevice: (deviceId: string | null) => void;
  setAvailableDevices: (devices: {
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  }) => void;

  // 상태 초기화
  reset: () => void;
}

const initialState = {
  status: "idle" as VideoCallStatus,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isFullscreen: false,
  participants: 0,
  error: null,

  roomId: null,
  roomName: null,
  callerId: null,
  callerName: null,

  selectedVideoDevice: null,
  selectedAudioDevice: null,
  availableVideoDevices: [],
  availableAudioDevices: [],
};

export const useVideoStore = create<VideoCallState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
  setFullscreen: (enabled) => set({ isFullscreen: enabled }),
  setParticipants: (count) => set({ participants: count }),
  setError: (error) => set({ error }),

  setCallInfo: (info) =>
    set({
      roomId: info.roomId,
      roomName: info.roomName,
      callerId: info.callerId,
      callerName: info.callerName,
    }),

  setSelectedVideoDevice: (deviceId) => set({ selectedVideoDevice: deviceId }),
  setSelectedAudioDevice: (deviceId) => set({ selectedAudioDevice: deviceId }),
  setAvailableDevices: (devices) =>
    set({
      availableVideoDevices: devices.videoDevices,
      availableAudioDevices: devices.audioDevices,
    }),

  reset: () => set(initialState),
}));
