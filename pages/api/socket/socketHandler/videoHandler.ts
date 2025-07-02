import { Socket } from "socket.io";
import { Server } from "socket.io";
import { logger } from "@/lib/logger";
import {
  VideoCallPayload,
  IceCandidatePayload,
  CallEventPayload,
  DeviceSettingsPayload,
  QualityMetricsPayload,
} from "@/types";

export const videoHandler = (socket: Socket, io: Server) => {
  const getRoomId = (roomId: string, callerId?: number) => {
    return callerId ? `dm_${roomId}:${callerId}` : `dm_${roomId}`;
  };

  const handleError = (event: string, error: any) => {
    logger.error(`Video ${event} error:`, error);
    socket.emit("video-error", {
      event,
      message: error.message || "알 수 없는 오류가 발생했습니다.",
    });
  };

  // 통화 요청
  socket.on("offer", (payload: VideoCallPayload) => {
    try {
      const { roomId, callerId, callerName, sdp } = payload;
      logger.info(`Video offer from ${callerName} in room ${roomId}`);

      // 룸 ID 생성 및 검증
      const targetRoomId = getRoomId(roomId, callerId);
      const roomExists = io.sockets.adapter.rooms.has(targetRoomId);

      if (!roomExists) {
        logger.warn(
          `Room ${targetRoomId} does not exist or target user is not connected`,
        );
        socket.emit("video-error", {
          event: "offer",
          message: "상대방이 오프라인 상태입니다.",
        });
        return;
      }

      socket.to(targetRoomId).emit("offer", payload);
      logger.info(`Offer sent to room ${targetRoomId}`);
    } catch (error) {
      handleError("offer", error);
    }
  });

  // 통화 응답
  socket.on("answer", (payload: VideoCallPayload) => {
    try {
      const { roomId, callerId, sdp } = payload;
      const targetRoomId = getRoomId(roomId, callerId);

      logger.info(`Video answer in room ${roomId}`);

      if (!io.sockets.adapter.rooms.has(targetRoomId)) {
        logger.warn(`Room ${targetRoomId} does not exist for answer`);
        socket.emit("video-error", {
          event: "answer",
          message: "통화가 이미 종료되었습니다.",
        });
        return;
      }

      socket.to(targetRoomId).emit("answer", payload);
      logger.info(`Answer sent to room ${targetRoomId}`);
    } catch (error) {
      handleError("answer", error);
    }
  });

  // ICE candidate 교환
  socket.on("ice-candidate", (payload: IceCandidatePayload) => {
    try {
      const { candidate, roomId } = payload;
      logger.debug(`ICE candidate exchange in room ${roomId}`);
      socket.to(getRoomId(roomId)).emit("ice-candidate", { candidate, roomId });
    } catch (error) {
      handleError("ice-candidate", error);
    }
  });

  // 통화 거절
  socket.on("call-rejected", (payload: CallEventPayload) => {
    try {
      const { roomId, userName, reason } = payload;
      logger.info(`Call rejected by ${userName} in room ${roomId}: ${reason}`);
      socket.to(getRoomId(roomId)).emit("call-rejected", { roomId, reason });
    } catch (error) {
      handleError("call-rejected", error);
    }
  });

  // 통화 종료
  socket.on("call-ended", (payload: CallEventPayload) => {
    try {
      const { roomId } = payload;
      logger.info(`Call ended in room ${roomId}`);
      socket.to(getRoomId(roomId)).emit("call-ended", { roomId });
    } catch (error) {
      handleError("call-ended", error);
    }
  });

  // 장치 설정 변경
  socket.on("device-settings-updated", (payload: DeviceSettingsPayload) => {
    try {
      const { roomId, settings } = payload;
      logger.info(`Device settings updated in room ${roomId}:`, settings);
      socket
        .to(getRoomId(roomId))
        .emit("device-settings-updated", { roomId, settings });
    } catch (error) {
      handleError("device-settings-updated", error);
    }
  });

  // 통화 품질 메트릭
  socket.on("call-quality-metrics", (payload: QualityMetricsPayload) => {
    try {
      const { roomId, metrics } = payload;
      logger.debug(`Call quality metrics in room ${roomId}:`, metrics);

      // 품질 문제 감지 및 알림
      if (
        metrics.packetLossRate > 5 ||
        metrics.roundTripTime > 300 ||
        metrics.jitter > 50
      ) {
        socket.to(getRoomId(roomId)).emit("call-quality-warning", {
          roomId,
          type:
            metrics.packetLossRate > 5
              ? "packet-loss"
              : metrics.roundTripTime > 300
                ? "latency"
                : "jitter",
          metrics,
        });
      }

      socket
        .to(getRoomId(roomId))
        .emit("call-quality-metrics", { roomId, metrics });
    } catch (error) {
      handleError("call-quality-metrics", error);
    }
  });

  // 연결 끊김 감지
  socket.on("disconnect", () => {
    try {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room.startsWith("dm_")) {
          logger.info(`User disconnected from video call in room ${room}`);
          socket.to(room).emit("peer-disconnected", {
            roomId: room.replace("dm_", "").split(":")[0],
          });
        }
      });
    } catch (error) {
      handleError("disconnect", error);
    }
  });
};
