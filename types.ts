import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type UserType = {
  user_id: number | null;
  id: number | null;
  user_name: string;
  photo_url: string;
  role: string;
};

export const defaultUser: UserType = {
  id: null,
  user_id: null,
  user_name: "",
  photo_url: "",
  role: "",
};

export type RoomsType = {
  chat_id: number;
  room_name: string;
  user_id: number;
  user_count: number;
};

export const defaultRooms: RoomsType = {
  chat_id: 0,
  room_name: "",
  user_count: 0,
  user_id: 0,
};

export type CategoriesType = {
  category_id: number;
  category_name: string;
  rooms: RoomsType[];
};

export const defaultCategories: CategoriesType = {
  category_id: 0,
  category_name: "",
  rooms: [],
};

export type CollapseStateType = {
  dm: boolean;
  room: boolean;
  entered: boolean;
};

export type messagesType = {
  message_id: number;
  content: string;
  sent_at: string;
  user_id: number;
  user_name: string;
  chat_id: number;
  room_name: string;
  category_id: number;
  category_name: string;
  message_type: string;
  photo_url: string;
};

export type dmListType = {
  id: number;
  room_id: string;
  user_id: number;
  other_id: number;
  other_name: string;
  other_photo_url: string | null;
  other_user_leave: number | null;
};

export type useFormType = {
  id: string;
  userId?: number;
  userName: string;
  password: string;
  photo: FileList | string | null;
};

// 영상통화 관련 타입
export interface VideoCallPayload {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
  userId: number;
  userName: string;
  callerId: number;
  callerName: string;
}

export interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
  roomId: string;
}

export interface CallEventPayload {
  roomId: string;
  reason?: string;
  userName: string;
}

export interface DeviceSettingsPayload {
  roomId: string;
  settings: {
    deviceType: "video" | "audio";
    deviceId: string;
  };
}

export interface QualityMetricsPayload {
  roomId: string;
  metrics: {
    packetLossRate: number;
    roundTripTime: number;
    jitter: number;
  };
}

export interface VideoCallInfo {
  roomId: string;
  userId: number;
  userName: string;
}

export interface VideoDeviceSettings {
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  availableVideoDevices: MediaDeviceInfo[];
  availableAudioDevices: MediaDeviceInfo[];
}
