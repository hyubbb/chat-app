import { test, expect } from "@playwright/test";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { io } from "socket.io-client";
import { createDMRoomId } from "../util/utils";
import {
  setupMockMediaDevices,
  setupMockRTCPeerConnection,
} from "./test-utils/mock-media";

test.describe("Video Call Integration Tests", () => {
  let httpServer: HttpServer;
  let io: SocketServer;
  let userSocket1: Socket;
  let userSocket2: Socket;
  const serverUrl = "http://localhost:3000";
  const roomId = "test-room-1";
  const userId1 = 1;
  const userId2 = 2;

  test.beforeAll(async () => {
    // HTTP 서버 및 Socket.IO 서버 설정
    httpServer = createServer();
    io = new SocketServer(httpServer);
    httpServer.listen(4001);

    // 미디어 모킹 설정
    setupMockMediaDevices();
    setupMockRTCPeerConnection();

    // 소켓 연결 설정
    userSocket1 = io(serverUrl);
    userSocket2 = io(serverUrl);

    await Promise.all([
      new Promise((resolve) => userSocket1.on("connect", resolve)),
      new Promise((resolve) => userSocket2.on("connect", resolve)),
    ]);
  });

  test.afterAll(async () => {
    // 리소스 정리
    await io.close();
    httpServer.close();
    userSocket1.disconnect();
    userSocket2.disconnect();
  });

  test("should establish WebRTC connection between two users", async () => {
    const user1Id = "1";
    const user2Id = "2";
    const roomId = createDMRoomId(parseInt(user1Id), parseInt(user2Id));

    // 통화 요청/응답 테스트
    const offerReceived = new Promise((resolve) => {
      userSocket2.on("offer", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(userId1);
        resolve(data);
      });
    });

    const answerReceived = new Promise((resolve) => {
      userSocket1.on("answer", (data) => {
        expect(data.roomId).toBe(roomId);
        resolve(data);
      });
    });

    // 통화 요청 전송
    userSocket1.emit("offer", {
      sdp: { type: "offer", sdp: "test-sdp" },
      roomId,
      userId: userId2,
      userName: "User 1",
    });

    // 통화 응답 전송
    userSocket2.emit("answer", {
      sdp: { type: "answer", sdp: "test-sdp" },
      roomId,
      userId: userId1,
      userName: "User 2",
    });

    await Promise.all([offerReceived, answerReceived]);
  });

  test("should handle call rejection", async () => {
    const user1Id = "1";
    const user2Id = "3";
    const roomId = createDMRoomId(parseInt(user1Id), parseInt(user2Id));

    const rejectionReceived = new Promise((resolve) => {
      userSocket1.on("call-rejected", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.reason).toBe("사용자가 통화를 거절했습니다.");
        resolve(data);
      });
    });

    userSocket2.emit("call-rejected", {
      roomId,
      userName: "User 2",
      reason: "사용자가 통화를 거절했습니다.",
    });

    await rejectionReceived;
  });

  test("should handle connection failures", async () => {
    const user1Id = "1";
    const user2Id = "4";
    const roomId = createDMRoomId(parseInt(user1Id), parseInt(user2Id));

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    // 연결 실패 시뮬레이션
    userSocket1.emit("offer", {
      roomId,
      userId: user2Id,
      userName: "User 1",
      sdp: { type: "offer", sdp: "test-sdp" },
    });

    // 재연결 시도 모니터링
    userSocket1.on("reconnect-attempt", () => {
      reconnectAttempts++;
    });

    // 최대 재연결 시도 횟수 확인
    await new Promise<void>((resolve) => {
      const checkReconnect = setInterval(() => {
        if (reconnectAttempts >= maxReconnectAttempts) {
          clearInterval(checkReconnect);
          resolve();
        }
      }, 2000);
    });

    expect(reconnectAttempts).toBeLessThanOrEqual(maxReconnectAttempts);
  });

  test("should handle device settings changes", async () => {
    const user1Id = "1";
    const user2Id = "5";
    const roomId = createDMRoomId(parseInt(user1Id), parseInt(user2Id));

    const settingsReceived = new Promise((resolve) => {
      userSocket2.on("device-settings-updated", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.settings.deviceType).toBe("video");
        expect(data.settings.deviceId).toBeDefined();
        resolve(data);
      });
    });

    userSocket1.emit("device-settings-updated", {
      roomId,
      settings: {
        deviceType: "video",
        deviceId: "test-device-id",
      },
    });

    await settingsReceived;
  });

  test("should handle ICE candidates exchange", async () => {
    const candidateReceived = new Promise((resolve) => {
      userSocket2.on("ice-candidate", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.candidate).toBeDefined();
        resolve(data);
      });
    });

    userSocket1.emit("ice-candidate", {
      candidate: {
        candidate: "test-candidate",
        sdpMid: "0",
        sdpMLineIndex: 0,
      },
      roomId,
    });

    await candidateReceived;
  });

  test("should handle call quality metrics", async () => {
    const metricsReceived = new Promise((resolve) => {
      userSocket2.on("call-quality-metrics", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.metrics).toBeDefined();
        expect(data.metrics.packetLossRate).toBeDefined();
        expect(data.metrics.roundTripTime).toBeDefined();
        expect(data.metrics.jitter).toBeDefined();
        resolve(data);
      });
    });

    userSocket1.emit("call-quality-metrics", {
      roomId,
      metrics: {
        packetLossRate: 1.5,
        roundTripTime: 150,
        jitter: 20,
      },
    });

    await metricsReceived;
  });

  test("should handle call quality warnings", async () => {
    const warningReceived = new Promise((resolve) => {
      userSocket2.on("call-quality-warning", (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.type).toBe("packet-loss");
        expect(data.metrics.packetLossRate).toBeGreaterThan(5);
        resolve(data);
      });
    });

    userSocket1.emit("call-quality-metrics", {
      roomId,
      metrics: {
        packetLossRate: 6.5,
        roundTripTime: 150,
        jitter: 20,
      },
    });

    await warningReceived;
  });

  test("should handle call end", async () => {
    const callEndReceived = new Promise((resolve) => {
      userSocket2.on("call-ended", (data) => {
        expect(data.roomId).toBe(roomId);
        resolve(data);
      });
    });

    userSocket1.emit("call-ended", {
      roomId,
      userName: "User 1",
    });

    await callEndReceived;
  });

  test("should handle peer disconnection", async () => {
    const disconnectionReceived = new Promise((resolve) => {
      userSocket2.on("peer-disconnected", (data) => {
        expect(data.roomId).toBe(roomId);
        resolve(data);
      });
    });

    // 소켓 연결 종료
    userSocket1.disconnect();

    await disconnectionReceived;
  });

  test("should handle media device errors", async () => {
    // 미디어 장치 에러 시뮬레이션
    // @ts-ignore
    global.navigator.mediaDevices.getUserMedia = async () => {
      throw new Error("미디어 장치에 접근할 수 없습니다.");
    };

    const errorReceived = new Promise((resolve) => {
      userSocket1.on("video-error", (data) => {
        expect(data.message).toBe("미디어 장치에 접근할 수 없습니다.");
        resolve(data);
      });
    });

    // 통화 시도
    userSocket1.emit("offer", {
      sdp: { type: "offer", sdp: "test-sdp" },
      roomId,
      userId: userId2,
      userName: "User 1",
    });

    await errorReceived;
  });

  test("should handle network quality degradation", async () => {
    const qualityWarningReceived = new Promise((resolve) => {
      userSocket2.on("call-quality-warning", (data) => {
        expect(data.type).toBe("latency");
        expect(data.metrics.roundTripTime).toBeGreaterThan(300);
        resolve(data);
      });
    });

    userSocket1.emit("call-quality-metrics", {
      roomId,
      metrics: {
        packetLossRate: 2,
        roundTripTime: 350,
        jitter: 30,
      },
    });

    await qualityWarningReceived;
  });
});
