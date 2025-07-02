# 영상통화 API 문서

## 소켓 이벤트

### 1. 통화 요청 (offer)
```typescript
interface OfferPayload {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
  userId: number;
  userName: string;
}

// 이벤트 발신
socket.emit("offer", {
  sdp: offer,
  roomId: "room-123",
  userId: 456,
  userName: "User Name"
});

// 이벤트 수신
socket.on("offer", (payload: OfferPayload) => {
  // 통화 요청 처리
});
```

### 2. 통화 응답 (answer)
```typescript
interface AnswerPayload {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
  userId: number;
  userName: string;
}

// 이벤트 발신
socket.emit("answer", {
  sdp: answer,
  roomId: "room-123",
  userId: 456,
  userName: "User Name"
});

// 이벤트 수신
socket.on("answer", (payload: AnswerPayload) => {
  // 통화 응답 처리
});
```

### 3. ICE 후보 교환 (ice-candidate)
```typescript
interface IceCandidatePayload {
  candidate: RTCIceCandidate;
  roomId: string;
}

// 이벤트 발신
socket.emit("ice-candidate", {
  candidate: candidate,
  roomId: "room-123"
});

// 이벤트 수신
socket.on("ice-candidate", (payload: IceCandidatePayload) => {
  // ICE 후보 처리
});
```

### 4. 통화 거절 (call-rejected)
```typescript
interface CallEventPayload {
  roomId: string;
  userName: string;
  reason?: string;
}

// 이벤트 발신
socket.emit("call-rejected", {
  roomId: "room-123",
  userName: "User Name",
  reason: "사용자가 통화를 거절했습니다."
});

// 이벤트 수신
socket.on("call-rejected", (payload: CallEventPayload) => {
  // 통화 거절 처리
});
```

### 5. 통화 종료 (call-ended)
```typescript
// 이벤트 발신
socket.emit("call-ended", {
  roomId: "room-123",
  userName: "User Name"
});

// 이벤트 수신
socket.on("call-ended", (payload: CallEventPayload) => {
  // 통화 종료 처리
});
```

### 6. 디바이스 설정 변경 (device-settings-updated)
```typescript
interface DeviceSettingsPayload {
  roomId: string;
  settings: {
    deviceType: "video" | "audio";
    deviceId: string;
  };
}

// 이벤트 발신
socket.emit("device-settings-updated", {
  roomId: "room-123",
  settings: {
    deviceType: "video",
    deviceId: "device-123"
  }
});

// 이벤트 수신
socket.on("device-settings-updated", (payload: DeviceSettingsPayload) => {
  // 디바이스 설정 변경 처리
});
```

### 7. 통화 품질 메트릭 (call-quality-metrics)
```typescript
interface QualityMetricsPayload {
  roomId: string;
  metrics: {
    packetLossRate: number;  // 패킷 손실률 (%)
    roundTripTime: number;   // 왕복 시간 (ms)
    jitter: number;         // 지터 (ms)
  };
}

// 이벤트 발신
socket.emit("call-quality-metrics", {
  roomId: "room-123",
  metrics: {
    packetLossRate: 1.5,
    roundTripTime: 150,
    jitter: 20
  }
});

// 이벤트 수신
socket.on("call-quality-metrics", (payload: QualityMetricsPayload) => {
  // 품질 메트릭 처리
});
```

### 8. 품질 경고 (call-quality-warning)
```typescript
interface QualityWarningPayload {
  roomId: string;
  type: "packet-loss" | "latency" | "jitter";
  metrics: {
    packetLossRate: number;
    roundTripTime: number;
    jitter: number;
  };
}

// 이벤트 수신
socket.on("call-quality-warning", (payload: QualityWarningPayload) => {
  // 품질 경고 처리
});
```

## 상태 관리 API

### VideoStore
```typescript
interface VideoCallState {
  // 상태
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

  // 디바이스 설정
  selectedVideoDevice: string | null;
  selectedAudioDevice: string | null;
  availableVideoDevices: MediaDeviceInfo[];
  availableAudioDevices: MediaDeviceInfo[];

  // 액션
  setStatus: (status: VideoCallStatus) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setFullscreen: (enabled: boolean) => void;
  setParticipants: (count: number) => void;
  setError: (error: string | null) => void;
  setCallInfo: (info: CallInfo) => void;
  setSelectedVideoDevice: (deviceId: string | null) => void;
  setSelectedAudioDevice: (deviceId: string | null) => void;
  setAvailableDevices: (devices: DeviceList) => void;
  reset: () => void;
}
```

## 컴포넌트 Props

### Video 컴포넌트
```typescript
interface VideoProps {
  dmInfo: {
    room_id: string;
    other_id: number;
    other_name: string;
    user_id: number;
  };
}
```

### DeviceSettings 컴포넌트
```typescript
interface DeviceSettingsProps {
  onDeviceChange: (deviceId: string, type: "video" | "audio") => Promise<void>;
}
```

## 에러 코드

| 코드 | 설명 | 처리 방법 |
|------|------|-----------|
| DEVICE_NOT_FOUND | 디바이스를 찾을 수 없음 | 다른 디바이스 선택 유도 |
| PERMISSION_DENIED | 디바이스 접근 권한 거부 | 권한 요청 다이얼로그 표시 |
| CONNECTION_FAILED | 연결 실패 | 자동 재연결 시도 |
| QUALITY_WARNING | 품질 저하 | 사용자에게 알림 표시 |
| TIMEOUT | 응답 시간 초과 | 통화 재시도 유도 | 