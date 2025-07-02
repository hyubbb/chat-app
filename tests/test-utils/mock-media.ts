export class MockMediaStream {
  private tracks: MockMediaStreamTrack[] = [];

  addTrack(track: MockMediaStreamTrack) {
    this.tracks.push(track);
  }

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === "video");
  }

  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === "audio");
  }
}

export class MockMediaStreamTrack {
  enabled = true;
  readyState = "live";

  constructor(public kind: "audio" | "video") {}

  stop() {
    this.readyState = "ended";
  }
}

export const setupMockMediaDevices = () => {
  const mockStream = new MockMediaStream();
  mockStream.addTrack(new MockMediaStreamTrack("video"));
  mockStream.addTrack(new MockMediaStreamTrack("audio"));

  // @ts-ignore
  global.navigator.mediaDevices = {
    getUserMedia: async () => mockStream,
    enumerateDevices: async () => [
      {
        deviceId: "mock-video-device",
        groupId: "mock-video-group",
        kind: "videoinput",
        label: "Mock Video Device",
      },
      {
        deviceId: "mock-audio-device",
        groupId: "mock-audio-group",
        kind: "audioinput",
        label: "Mock Audio Device",
      },
    ],
  };

  // @ts-ignore
  global.MediaStream = MockMediaStream;
  // @ts-ignore
  global.MediaStreamTrack = MockMediaStreamTrack;
};

export const setupMockRTCPeerConnection = () => {
  class MockRTCPeerConnection {
    localDescription: RTCSessionDescription | null = null;
    remoteDescription: RTCSessionDescription | null = null;
    iceConnectionState = "new";
    connectionState = "new";
    onicecandidate: ((event: any) => void) | null = null;
    ontrack: ((event: any) => void) | null = null;
    oniceconnectionstatechange: (() => void) | null = null;

    constructor(public configuration?: RTCConfiguration) {}

    async createOffer() {
      return {
        type: "offer",
        sdp: "mock-sdp",
      };
    }

    async createAnswer() {
      return {
        type: "answer",
        sdp: "mock-sdp",
      };
    }

    async setLocalDescription(description: RTCSessionDescriptionInit) {
      this.localDescription = description as RTCSessionDescription;
    }

    async setRemoteDescription(description: RTCSessionDescriptionInit) {
      this.remoteDescription = description as RTCSessionDescription;
    }

    addTrack(track: MediaStreamTrack, stream: MediaStream) {
      if (this.ontrack) {
        this.ontrack({
          track,
          streams: [stream],
        });
      }
    }

    close() {
      this.iceConnectionState = "closed";
      this.connectionState = "closed";
    }

    // ICE 후보 시뮬레이션
    simulateIceCandidate() {
      if (this.onicecandidate) {
        this.onicecandidate({
          candidate: {
            candidate: "mock-ice-candidate",
            sdpMid: "0",
            sdpMLineIndex: 0,
          },
        });
      }
    }

    // 연결 상태 변경 시뮬레이션
    simulateConnectionStateChange(state: string) {
      this.iceConnectionState = state;
      if (this.oniceconnectionstatechange) {
        this.oniceconnectionstatechange();
      }
    }
  }

  // @ts-ignore
  global.RTCPeerConnection = MockRTCPeerConnection;
};
