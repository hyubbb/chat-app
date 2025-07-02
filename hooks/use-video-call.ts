import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/store/use-store";
import { useVideoStore } from "@/store/use-video-store";
import { useToastStore } from "@/store/use-toast-store";
import {
  VideoCallPayload,
  IceCandidatePayload,
  CallEventPayload,
  VideoCallInfo,
} from "@/types";
import { dmListType } from "@/types";

export const useVideoCall = (dmInfo: dmListType | null) => {
  const { socket, isConnected } = useStore();
  const { showToast } = useToastStore();
  const {
    status,
    isVideoEnabled,
    isAudioEnabled,
    selectedVideoDevice,
    selectedAudioDevice,
    setStatus,
    setError,
    setCallInfo,
    setParticipants,
  } = useVideoStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  // 리소스 정리
  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    if (remoteVideoRef.current?.srcObject) {
      const stream = remoteVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    setReconnectAttempts(0);
  }, []);

  // 미디어 초기화
  const initializeMedia = useCallback(async (): Promise<void> => {
    try {
      console.log("=== 미디어 초기화 시작 ===");

      // 기존 스트림 정리
      if (localVideoRef.current?.srcObject) {
        const oldStream = localVideoRef.current.srcObject as MediaStream;
        console.log("기존 스트림 정리 중");
        oldStream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }

      // 새 스트림 생성
      console.log("새 미디어 스트림 요청 중...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideoDevice
          ? { deviceId: selectedVideoDevice }
          : isVideoEnabled,
        audio: selectedAudioDevice
          ? { deviceId: selectedAudioDevice }
          : isAudioEnabled,
      });

      console.log("미디어 스트림 생성 성공:", {
        trackCount: stream.getTracks().length,
        tracks: stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
      });

      // 로컬 비디오 요소에 스트림 설정
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("로컬 비디오 요소에 스트림 설정 완료");

        // 로컬 비디오 재생 시도
        try {
          await localVideoRef.current.play();
          console.log("로컬 비디오 재생 성공");
        } catch (playError) {
          console.log(
            "로컬 비디오 자동 재생 실패 (정상):",
            (playError as Error).message,
          );
        }

        // 메타데이터 로드 이벤트 리스너
        localVideoRef.current.onloadedmetadata = () => {
          console.log("로컬 비디오 메타데이터 로드됨");
          if (localVideoRef.current) {
            localVideoRef.current
              .play()
              .catch((e) => console.log("로컬 비디오 재생 실패:", e.message));
          }
        };
      } else {
        console.warn("localVideoRef.current가 null입니다!");
      }

      // 기존 PeerConnection이 있으면 정리
      if (peerConnectionRef.current) {
        console.log("기존 PeerConnection 정리 중");
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // WebRTC 연결 설정
      console.log("새 PeerConnection 생성 중");
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // TURN 서버 추가 예정
        ],
      });

      // 스트림 추가
      console.log("PeerConnection에 스트림 추가 중");
      stream.getTracks().forEach((track) => {
        console.log(
          `트랙 추가 - ${track.kind}: enabled=${track.enabled}, readyState=${track.readyState}`,
        );
        peerConnection.addTrack(track, stream);
      });

      // 원격 스트림 처리
      peerConnection.ontrack = (event) => {
        console.log("=== 원격 스트림 수신 ===");
        console.log("Event streams:", event.streams);
        console.log("Event track:", {
          kind: event.track.kind,
          enabled: event.track.enabled,
          readyState: event.track.readyState,
          id: event.track.id,
        });

        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          console.log("원격 스트림 트랙 수:", remoteStream.getTracks().length);
          console.log(
            "원격 스트림 트랙 상세:",
            remoteStream.getTracks().map((track) => ({
              kind: track.kind,
              enabled: track.enabled,
              readyState: track.readyState,
              id: track.id,
            })),
          );

          if (remoteVideoRef.current) {
            // 기존 스트림이 있으면 정리
            if (remoteVideoRef.current.srcObject) {
              const oldStream = remoteVideoRef.current.srcObject as MediaStream;
              console.log("기존 원격 스트림 정리");
              oldStream.getTracks().forEach((track) => track.stop());
            }

            remoteVideoRef.current.srcObject = remoteStream;
            setParticipants(2); // 1:1 통화이므로 2명으로 고정
            console.log("원격 비디오 요소에 스트림 설정 완료");

            // 비디오 요소 이벤트 리스너 추가
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log("원격 비디오 메타데이터 로드됨");
              remoteVideoRef.current
                ?.play()
                .then(() => console.log("원격 비디오 재생 시작"))
                .catch((e) => console.error("원격 비디오 재생 실패:", e));
            };

            // 즉시 재생 시도
            remoteVideoRef.current
              .play()
              .then(() => console.log("원격 비디오 즉시 재생 성공"))
              .catch((e) =>
                console.log("원격 비디오 즉시 재생 실패 (정상):", e.message),
              );
          }
        } else {
          console.warn("원격 스트림이 없습니다");
        }
      };

      // ICE 후보 처리
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket && dmInfo) {
          console.log("ICE 후보 전송:", event.candidate);
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            roomId: dmInfo.room_id,
          });
        }
      };

      // 연결 상태 변경 처리
      peerConnection.onconnectionstatechange = () => {
        console.log(
          "PeerConnection 상태 변경:",
          peerConnection.connectionState,
        );
        switch (peerConnection.connectionState) {
          case "connected":
            setStatus("connected");
            showToast("통화가 연결되었습니다.", "success", 3000);
            break;
          case "disconnected":
            setStatus("reconnecting");
            showToast(
              "연결이 불안정합니다. 재연결을 시도합니다.",
              "warning",
              3000,
            );
            // handleReconnection 직접 호출 대신 상태만 변경
            break;
          case "failed":
            setStatus("failed");
            setError("연결에 실패했습니다. 다시 시도해주세요.");
            cleanup();
            break;
          case "closed":
            setStatus("ended");
            cleanup();
            break;
        }
      };

      peerConnectionRef.current = peerConnection;

      console.log("=== 미디어 초기화 완료 ===");
      console.log("로컬 스트림 트랙 수:", stream.getTracks().length);
      console.log("로컬 비디오 요소 스트림:", localVideoRef.current?.srcObject);
      console.log("PeerConnection 생성됨:", !!peerConnectionRef.current);
    } catch (error) {
      console.error("미디어 초기화 실패:", error);
      setError("카메라 또는 마이크에 접근할 수 없습니다.");
      showToast("카메라 또는 마이크에 접근할 수 없습니다.", "error", 3000);
      setStatus("failed");
    }
  }, [
    isVideoEnabled,
    isAudioEnabled,
    selectedVideoDevice,
    selectedAudioDevice,
    socket,
    dmInfo,
    setStatus,
    setError,
    setParticipants,
    showToast,
    cleanup,
  ]);

  // 재연결 처리
  const handleReconnection = useCallback(async (): Promise<void> => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setStatus("failed");
      setError("재연결 시도 횟수를 초과했습니다.");
      cleanup();
      return;
    }

    try {
      await initializeMedia();
      setReconnectAttempts((prev: number) => prev + 1);
    } catch (error) {
      console.error("재연결 실패:", error);
      setStatus("failed");
      setError("재연결에 실패했습니다.");
      cleanup();
    }
  }, [
    reconnectAttempts,
    maxReconnectAttempts,
    initializeMedia,
    setStatus,
    setError,
    cleanup,
  ]);

  // 통화 요청 처리
  const handleCallRequest = useCallback(async (): Promise<void> => {
    try {
      console.log("=== 통화 요청 시작 (신청자) ===");
      console.log("dmInfo:", dmInfo);
      console.log("socket:", socket);
      console.log("socket connected:", socket?.connected);

      if (!dmInfo || !socket) {
        console.error("dmInfo 또는 socket이 없습니다");
        return;
      }

      console.log("⏳ 미디어 초기화 중 (신청자)");
      await initializeMedia();

      if (!peerConnectionRef.current) {
        console.error("PeerConnection이 초기화되지 않았습니다.");
        return;
      }

      console.log(
        "PeerConnection 상태:",
        peerConnectionRef.current.signalingState,
      );

      // 🔥 신청자의 로컬 스트림 확인 및 PeerConnection 추가
      console.log("🔍 신청자 로컬 스트림 확인:");
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        console.log("✅ 신청자 로컬 스트림 있음:", {
          trackCount: stream.getTracks().length,
          tracks: stream.getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
          })),
        });

        // 기존 senders 확인
        const existingSenders = peerConnectionRef.current.getSenders();
        console.log(
          "기존 Senders:",
          existingSenders.map((s) => ({
            kind: s.track?.kind,
            enabled: s.track?.enabled,
          })),
        );

        // 각 트랙을 확인하고 추가
        console.log("📤 신청자 → 수신자로 스트림 전송 준비");
        stream.getTracks().forEach((track) => {
          const existingSender = existingSenders.find(
            (s) => s.track?.kind === track.kind,
          );
          if (!existingSender) {
            console.log(
              `📤 신청자 새 트랙 추가: ${track.kind} - enabled: ${track.enabled}`,
            );
            peerConnectionRef.current?.addTrack(track, stream);
          } else {
            console.log(`📤 신청자 기존 ${track.kind} 트랙 발견, 교체 시도`);
            existingSender
              .replaceTrack(track)
              .catch((e) => console.log(`트랙 교체 실패: ${e.message}`));
          }
        });

        // 최종 senders 상태 확인
        const finalSenders = peerConnectionRef.current.getSenders();
        console.log(
          "📤 신청자 최종 Senders (수신자에게 전송될 스트림):",
          finalSenders.map((s) => ({
            kind: s.track?.kind,
            enabled: s.track?.enabled,
            readyState: s.track?.readyState,
          })),
        );
      } else {
        console.error(
          "❌ 신청자 로컬 스트림이 없음! 수신자가 신청자 화면을 볼 수 없음",
        );
      }

      // Offer 생성
      console.log("📤 Offer 생성 중...");
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // 로컬 설명 설정
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log("✅ Offer 생성 및 로컬 설정 완료");

      // Offer 전송
      const payload = {
        sdp: offer,
        roomId: dmInfo.room_id,
        userId: dmInfo.other_id,
        userName: dmInfo.other_name,
      };

      console.log("📤 Offer 전송 중:", payload);
      socket.emit("offer", payload);

      setStatus("requesting");
      console.log("상태를 requesting으로 변경");
    } catch (error) {
      console.error("통화 요청 실패:", error);
      setError("통화 연결에 실패했습니다.");
      cleanup();
    }
  }, [dmInfo, socket, initializeMedia, setStatus, setError, cleanup]);

  // 통화 수락 처리
  const handleAcceptCall = useCallback(async (): Promise<void> => {
    try {
      console.log("=== 통화 수락 시작 ===");
      console.log(
        "PeerConnection 상태:",
        peerConnectionRef.current?.signalingState,
      );

      if (!dmInfo || !socket) {
        console.error("dmInfo 또는 socket이 없습니다");
        return;
      }

      if (!peerConnectionRef.current) {
        console.error("PeerConnection이 없습니다. offer를 먼저 받아야 합니다.");
        return;
      }

      // PeerConnection이 answer를 생성할 수 있는 상태인지 확인
      if (peerConnectionRef.current.signalingState !== "have-remote-offer") {
        console.error(
          "PeerConnection이 answer를 생성할 수 있는 상태가 아닙니다:",
          peerConnectionRef.current.signalingState,
        );
        return;
      }

      // 현재 로컬 스트림과 senders 상태 확인
      console.log(
        "통화 수락 시 로컬 스트림:",
        localVideoRef.current?.srcObject,
      );
      const senders = peerConnectionRef.current.getSenders();
      console.log(
        "통화 수락 시 현재 Senders:",
        senders.map((s) => ({
          kind: s.track?.kind,
          enabled: s.track?.enabled,
          readyState: s.track?.readyState,
        })),
      );

      // 로컬 스트림이 없거나 senders가 없으면 스트림 추가
      if (!localVideoRef.current?.srcObject || senders.length === 0) {
        console.log("로컬 스트림 또는 senders가 없어서 미디어 다시 설정");

        // 새 스트림 생성
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice
            ? { deviceId: selectedVideoDevice }
            : isVideoEnabled,
          audio: selectedAudioDevice
            ? { deviceId: selectedAudioDevice }
            : isAudioEnabled,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("로컬 비디오 스트림 설정 완료");
        }

        // PeerConnection에 스트림 추가
        stream.getTracks().forEach((track) => {
          console.log(
            `통화 수락 시 트랙 추가: ${track.kind} - enabled: ${track.enabled}`,
          );
          peerConnectionRef.current?.addTrack(track, stream);
        });
      } else {
        console.log("이미 로컬 스트림과 senders가 설정되어 있음");
      }

      console.log("Answer 생성 중...");
      // Answer 생성
      const answer = await peerConnectionRef.current.createAnswer();

      // 로컬 설명 설정
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log("Answer 생성 및 로컬 설정 완료");

      // Answer 전송
      const payload = {
        sdp: answer,
        roomId: dmInfo.room_id,
      };

      console.log("Answer 전송 중:", payload);
      socket.emit("answer", payload);

      setStatus("connecting");
      console.log("상태를 connecting으로 변경");
    } catch (error) {
      console.error("통화 수락 실패:", error);
      setError("통화 연결에 실패했습니다.");
      cleanup();
    }
  }, [
    dmInfo,
    socket,
    selectedVideoDevice,
    selectedAudioDevice,
    isVideoEnabled,
    isAudioEnabled,
    setStatus,
    setError,
    cleanup,
  ]);

  // 통화 거절
  const rejectCall = useCallback(() => {
    if (!socket || !dmInfo) return;

    socket.emit("call-rejected", {
      roomId: dmInfo.room_id.toString(),
      reason: "상대방이 통화를 거절했습니다.",
    });

    cleanup();
    setStatus("idle");
  }, [socket, dmInfo, cleanup, setStatus]);

  // 통화 종료
  const endCall = useCallback(() => {
    socket?.emit("call-ended", {
      roomId: dmInfo?.room_id,
    });
    cleanup();
    // 통화 종료 후 처음 상태로 돌아가기
    setStatus("idle");
  }, [socket, dmInfo?.room_id, setStatus, cleanup]);

  // 디바이스 변경 처리
  const handleDeviceChange = useCallback(
    async (deviceId: string, type: "video" | "audio"): Promise<void> => {
      try {
        console.log(`=== 디바이스 변경: ${type} → ${deviceId} ===`);

        // 새로운 미디어 스트림 생성
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: type === "video" ? { deviceId } : isVideoEnabled,
          audio: type === "audio" ? { deviceId } : isAudioEnabled,
        });

        console.log(
          `새 스트림 생성됨 - 트랙 수: ${newStream.getTracks().length}`,
        );

        // 기존 로컬 스트림 정리
        if (localVideoRef.current?.srcObject) {
          const oldStream = localVideoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach((track) => {
            console.log(`기존 트랙 정지: ${track.kind}`);
            track.stop();
          });
        }

        // 새 스트림을 로컬 비디오에 설정
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
          console.log("로컬 비디오에 새 스트림 설정됨");
        }

        // PeerConnection이 연결되어 있으면 트랙 교체
        if (peerConnectionRef.current && status === "connected") {
          console.log("PeerConnection에서 트랙 교체 시작");

          const senders = peerConnectionRef.current.getSenders();
          console.log(`현재 Sender 수: ${senders.length}`);

          // 변경된 타입의 트랙만 교체
          const newTrack = newStream
            .getTracks()
            .find((track) => track.kind === type);
          const sender = senders.find((s) => s.track?.kind === type);

          if (newTrack && sender) {
            console.log(`${type} 트랙 교체 중...`);
            await sender.replaceTrack(newTrack);
            console.log(`${type} 트랙 교체 완료`);
          } else if (newTrack && !sender) {
            // 해당 타입의 sender가 없으면 새로 추가
            console.log(`${type} 트랙 새로 추가 중...`);
            peerConnectionRef.current.addTrack(newTrack, newStream);
            console.log(`${type} 트랙 추가 완료`);
          } else {
            console.warn(`${type} 트랙 또는 sender를 찾을 수 없음`);
          }

          // 다른 타입의 기존 트랙들도 새 스트림에 추가
          const otherTracks = newStream
            .getTracks()
            .filter((track) => track.kind !== type);
          otherTracks.forEach((track) => {
            const existingSender = senders.find(
              (s) => s.track?.kind === track.kind,
            );
            if (!existingSender) {
              console.log(`기존 ${track.kind} 트랙 새 스트림에 추가`);
              peerConnectionRef.current?.addTrack(track, newStream);
            }
          });
        }

        console.log("디바이스 변경 완료");
      } catch (error) {
        console.error("디바이스 변경 실패:", error);
        throw error; // 에러를 상위로 전파하여 UI에서 처리할 수 있도록
      }
    },
    [isVideoEnabled, isAudioEnabled, status],
  );

  // 소켓 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) return;

    // 통화 요청 수신
    socket.on("offer", async (payload: VideoCallPayload) => {
      try {
        console.log("=== OFFER 수신 (통화 받는 사람) ===");
        console.log("통화 요청 수신:", payload);

        // 이미 통화 중인지 확인
        const isCallActive = !["idle", "failed", "ended"].includes(status);
        if (isCallActive) {
          socket.emit("call-rejected", {
            roomId: payload.roomId,
            userName: dmInfo?.other_name || "상대방",
            reason: "이미 다른 통화 중입니다.",
          });
          return;
        }

        console.log("⏳ 미디어 초기화 시작 (수신자)");
        // 미디어 초기화
        await initializeMedia();

        if (!peerConnectionRef.current) {
          throw new Error("WebRTC 연결이 초기화되지 않았습니다.");
        }

        console.log("📥 원격 Offer 설정 중");
        console.log(
          "Offer 처리 전 PeerConnection state:",
          peerConnectionRef.current.signalingState,
        );

        // 원격 설명 설정
        const { sdp } = payload;
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );

        console.log("✅ Offer 처리 완료");
        console.log(
          "Offer 처리 후 PeerConnection state:",
          peerConnectionRef.current.signalingState,
        );

        // 🔥 중요: 수신자의 로컬 스트림 상태 확인
        console.log("🔍 수신자 로컬 스트림 확인:");
        if (localVideoRef.current?.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          console.log("✅ 로컬 스트림 있음:", {
            trackCount: stream.getTracks().length,
            tracks: stream.getTracks().map((t) => ({
              kind: t.kind,
              enabled: t.enabled,
              readyState: t.readyState,
            })),
          });

          // PeerConnection에 로컬 스트림 추가 (수신자가 자신의 스트림을 전송)
          console.log("📤 수신자 → 신청자로 스트림 전송 준비");
          stream.getTracks().forEach((track) => {
            console.log(
              `📤 수신자 트랙 추가: ${track.kind} - enabled: ${track.enabled}`,
            );
            peerConnectionRef.current?.addTrack(track, stream);
          });

          // 추가 후 상태 확인
          const senders = peerConnectionRef.current.getSenders();
          console.log(
            "📤 수신자 Senders (신청자에게 전송될 스트림):",
            senders.map((s) => ({
              kind: s.track?.kind,
              enabled: s.track?.enabled,
              readyState: s.track?.readyState,
            })),
          );
        } else {
          console.error(
            "❌ 수신자 로컬 스트림이 없음! 신청자가 수신자 화면을 볼 수 없음",
          );
        }

        // 상태 업데이트
        setStatus("incoming");
        setCallInfo({
          roomId: payload.roomId,
          roomName: payload.roomId,
          callerId: payload.userId,
          callerName: payload.userName,
        });

        showToast(`${payload.userName}님이 통화를 요청했습니다.`, "info", 5000);
      } catch (error) {
        console.error("통화 요청 처리 실패:", error);
        socket.emit("call-rejected", {
          roomId: payload.roomId,
          userName: dmInfo?.other_name || "상대방",
          reason: "통화 요청을 처리할 수 없습니다.",
        });
        setStatus("failed");
        cleanup();
      }
    });

    // 통화 응답 수신
    socket.on("answer", async (payload: VideoCallPayload) => {
      try {
        if (!peerConnectionRef.current) {
          throw new Error("WebRTC 연결이 초기화되지 않았습니다.");
        }

        console.log("=== ANSWER 수신 (통화 신청자) ===");
        console.log("Answer payload:", payload);
        console.log(
          "Answer 처리 전 PeerConnection state:",
          peerConnectionRef.current.signalingState,
        );

        // PeerConnection 상태 확인
        if (peerConnectionRef.current.signalingState !== "have-local-offer") {
          console.warn(
            "PeerConnection이 answer를 받을 수 있는 상태가 아닙니다:",
            peerConnectionRef.current.signalingState,
          );
          return;
        }

        const { sdp } = payload;

        // 원격 설명 설정
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );

        console.log("✅ Answer 처리 완료");
        console.log(
          "Answer 처리 후 PeerConnection state:",
          peerConnectionRef.current.signalingState,
        );

        // 신청자의 스트림 전송 상태 확인
        const senders = peerConnectionRef.current.getSenders();
        const receivers = peerConnectionRef.current.getReceivers();

        console.log(
          "📤 신청자 Senders (수신자에게 전송 중인 스트림):",
          senders.map((s) => ({
            kind: s.track?.kind,
            enabled: s.track?.enabled,
            readyState: s.track?.readyState,
          })),
        );

        console.log(
          "📥 신청자 Receivers (수신자로부터 받을 스트림):",
          receivers.map((r) => ({
            kind: r.track?.kind,
            enabled: r.track?.enabled,
            readyState: r.track?.readyState,
          })),
        );

        setStatus("connecting");
      } catch (error) {
        console.error("통화 응답 처리 실패:", error);
        setError("통화 연결을 설정할 수 없습니다.");
        setStatus("failed");
        cleanup();
      }
    });

    // ICE 후보 수신
    socket.on("ice-candidate", async (payload: IceCandidatePayload) => {
      try {
        if (!peerConnectionRef.current) return;

        console.log("ICE 후보 수신:", payload);
        const { candidate } = payload;

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } catch (error) {
        console.error("ICE 후보 처리 실패:", error);
      }
    });

    // 통화 거절 수신
    socket.on("call-rejected", (payload: CallEventPayload) => {
      console.log("통화 거절 수신:", payload);
      const { reason } = payload;
      showToast(reason || "상대방이 통화를 거절했습니다.", "info", 3000);
      cleanup();
      setStatus("idle");
    });

    // 통화 종료 수신
    socket.on("call-ended", () => {
      console.log("통화 종료 수신");
      showToast("통화가 종료되었습니다.", "info", 3000);
      cleanup();
      // 통화 종료 후 처음 상태로 돌아가기
      setStatus("idle");
    });

    // 연결 끊김 수신
    socket.on("peer-disconnected", () => {
      console.log("연결 끊김 수신");
      setError("상대방의 연결이 끊어졌습니다.");
      setStatus("failed");
      cleanup();
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("peer-disconnected");
    };
  }, [
    socket,
    status,
    dmInfo,
    initializeMedia,
    cleanup,
    setStatus,
    setError,
    setCallInfo,
    showToast,
  ]);

  // 통화 품질 모니터링
  useEffect(() => {
    if (
      !peerConnectionRef.current ||
      !socket ||
      !dmInfo ||
      status !== "connected"
    )
      return;

    let statsInterval: NodeJS.Timeout;

    const monitorCallQuality = async () => {
      try {
        const stats = await peerConnectionRef.current?.getStats();
        if (!stats) return;

        let totalPacketsLost = 0;
        let totalPacketsSent = 0;
        let roundTripTime = 0;
        let jitter = 0;
        let statsCount = 0;

        stats.forEach((report) => {
          if (report.type === "outbound-rtp") {
            totalPacketsLost += report.packetsLost || 0;
            totalPacketsSent += report.packetsSent || 0;
          } else if (report.type === "remote-inbound-rtp") {
            roundTripTime += report.roundTripTime || 0;
            jitter += report.jitter || 0;
            statsCount++;
          }
        });

        // 평균값 계산
        const packetLossRate =
          totalPacketsSent > 0
            ? (totalPacketsLost / totalPacketsSent) * 100
            : 0;
        const avgRoundTripTime =
          statsCount > 0 ? (roundTripTime / statsCount) * 1000 : 0;
        const avgJitter = statsCount > 0 ? (jitter / statsCount) * 1000 : 0;

        // 품질 메트릭 전송
        socket.emit("call-quality-metrics", {
          roomId: dmInfo.room_id,
          metrics: {
            packetLossRate,
            roundTripTime: avgRoundTripTime,
            jitter: avgJitter,
          },
        });

        // 품질 경고 표시
        if (packetLossRate > 5) {
          showToast(
            "네트워크 상태가 불안정합니다. 패킷 손실이 높습니다.",
            "warning",
            5000,
          );
        } else if (avgRoundTripTime > 300) {
          showToast("네트워크 지연이 발생하고 있습니다.", "warning", 5000);
        } else if (avgJitter > 50) {
          showToast("네트워크 지터가 높습니다.", "warning", 5000);
        }

        // 심각한 품질 저하 시 재연결 시도
        if (packetLossRate > 15 || avgRoundTripTime > 1000 || avgJitter > 100) {
          setStatus("reconnecting");
          handleReconnection();
        }
      } catch (error) {
        console.error("통화 품질 모니터링 실패:", error);
      }
    };

    // 2초마다 품질 체크
    statsInterval = setInterval(monitorCallQuality, 2000);

    return () => {
      clearInterval(statsInterval);
    };
  }, [socket, dmInfo, status, showToast, setStatus, handleReconnection]);

  // 미디어 장치 상태 확인
  const checkMediaDevices = useCallback(async () => {
    try {
      console.log("=== 미디어 장치 상태 확인 ===");

      // 사용 가능한 장치 목록
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("사용 가능한 장치:", {
        videoDevices: devices.filter((d) => d.kind === "videoinput").length,
        audioDevices: devices.filter((d) => d.kind === "audioinput").length,
        devices: devices.map((d) => ({
          kind: d.kind,
          label: d.label,
          deviceId: d.deviceId.slice(0, 8) + "...",
        })),
      });

      // 현재 활성 스트림 확인
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        console.log("현재 로컬 스트림:", {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            label: t.label,
          })),
        });
      } else {
        console.log("현재 로컬 스트림: 없음");
      }

      // 권한 상태 확인
      try {
        const permissions = await Promise.all([
          navigator.permissions.query({ name: "camera" as PermissionName }),
          navigator.permissions.query({ name: "microphone" as PermissionName }),
        ]);
        console.log("미디어 권한 상태:", {
          camera: permissions[0].state,
          microphone: permissions[1].state,
        });
      } catch (e) {
        console.log("권한 상태 확인 불가");
      }

      // 테스트 스트림 생성 시도
      console.log("테스트 스트림 생성 시도...");
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("테스트 스트림 생성 성공:", {
        trackCount: testStream.getTracks().length,
        videoTrack: testStream.getVideoTracks()[0]?.readyState,
        audioTrack: testStream.getAudioTracks()[0]?.readyState,
      });

      // 테스트 스트림 정리
      testStream.getTracks().forEach((track) => track.stop());
      console.log("테스트 스트림 정리 완료");
    } catch (error) {
      console.error("미디어 장치 확인 실패:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          console.log("-> 사용자가 권한을 거부했거나 다른 앱에서 사용 중");
        } else if (error.name === "NotFoundError") {
          console.log("-> 카메라/마이크를 찾을 수 없음");
        } else if (error.name === "NotReadableError") {
          console.log("-> 장치가 다른 곳에서 사용 중이거나 하드웨어 오류");
        } else if (error.name === "OverconstrainedError") {
          console.log("-> 요청한 제약 조건을 만족하는 장치가 없음");
        }
      }
    }
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    initializeMedia,
    handleCallRequest,
    handleAcceptCall,
    handleDeviceChange,
    rejectCall,
    endCall,
    handleMediaInitialization: initializeMedia,
    checkMediaDevices,
    // 디버깅용 함수
    checkStreams: () => {
      console.log("=== 스트림 상태 확인 ===");
      console.log("로컬 비디오 요소:", localVideoRef.current);
      console.log("원격 비디오 요소:", remoteVideoRef.current);
      console.log("로컬 스트림:", localVideoRef.current?.srcObject);
      console.log("원격 스트림:", remoteVideoRef.current?.srcObject);
      console.log("PeerConnection:", peerConnectionRef.current);
      console.log(
        "PeerConnection 상태:",
        peerConnectionRef.current?.connectionState,
      );

      if (peerConnectionRef.current) {
        console.log(
          "Senders:",
          peerConnectionRef.current.getSenders().map((s) => ({
            track: s.track
              ? { kind: s.track.kind, enabled: s.track.enabled }
              : null,
          })),
        );
        console.log(
          "Receivers:",
          peerConnectionRef.current.getReceivers().map((r) => ({
            track: r.track
              ? { kind: r.track.kind, enabled: r.track.enabled }
              : null,
          })),
        );
      }
    },
  };
};
