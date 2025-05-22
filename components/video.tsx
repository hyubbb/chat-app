import { useStore } from "@/store/use-store";
import { useToastStore } from "@/store/use-toast-store";
import { dmListType } from "@/types";
import { LucideVideo } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const Video = ({ dmInfo }: { dmInfo: dmListType | null }) => {
  const { socket, isConnected } = useStore();
  const { showToast } = useToastStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // 카메라와 마이크 스트림을 가져오고, localVideoRef와 remoteVideoRef에 할당
  const initializeMedia = async () => {
    console.log("initializeMedia");
    if (!localVideoRef.current || !remoteVideoRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.ontrack = (event) => {
      console.log("ontrack", dmInfo?.id);
      remoteVideoRef.current!.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer
        // You can use your existing socket implementation here
        // console.log("ICE Candidate:", event.candidate);
      }
    };
    peerConnectionRef.current = peerConnection;
    console.log("initializeMedia end");
  };

  // 영상통화 시작
  const startCall = async () => {
    console.log("startCall");
    console.log(peerConnectionRef.current);
    if (!peerConnectionRef.current) return;

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    console.log(dmInfo);

    // 상대방에게 통화 요청과 함께 토스트 알림을 위한 데이터 전송
    socket.emit("offer", {
      sdp: offer,
      roomId: dmInfo?.room_id,
      userId: dmInfo?.other_id,
      userName: dmInfo?.other_name || "사용자",
    });

    // 상대방에게 통화 요청 알림을 보내는 이벤트 추가
    socket.emit("call-request", {
      chatId: dmInfo?.room_id,
      userName: dmInfo?.other_name || "사용자",
    });
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCallActive(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "offer",
      async ({
        sdp,
        userName,
      }: {
        sdp: RTCSessionDescriptionInit;
        userName: string;
      }) => {
        console.log("[client] offer", peerConnectionRef.current);

        // if (!peerConnectionRef.current) return;

        if (!peerConnectionRef.current) {
          await initializeMedia(); // 상대방이 Offer를 보내면 자동으로 초기화
        }

        await peerConnectionRef?.current?.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );
        const answer = await peerConnectionRef?.current?.createAnswer();
        await peerConnectionRef?.current?.setLocalDescription(answer);

        socket.emit("answer", {
          sdp: answer,
          chatId: dmInfo?.room_id,
          userName: dmInfo?.name || "사용자", // 사용자 이름 추가
        });
      },
    );

    // 통화 요청 알림을 받는 이벤트 리스너 추가
    socket.on("call-request", ({ userName }: { userName: string }) => {
      // 기존 토스트 컴포넌트를 사용해 알림 표시
      showToast(`${userName}님이 영상통화를 요청했습니다.`, "info", 5000);
    });

    socket.on("answer", async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
      console.log("[client] answer", peerConnectionRef.current);
      if (!peerConnectionRef.current) return;
      console.log("answer");
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(sdp),
      );
    });

    socket.on(
      "ice-candidate",
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (!peerConnectionRef.current) return;

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      },
    );

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      socket.off("call-request");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, dmInfo, showToast]);
  return (
    <div className="flex items-center justify-center">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={isCallActive ? { width: "200px" } : { width: 0 }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        style={isCallActive ? { width: "200px" } : { width: 0 }}
      />
      {!isCallActive ? (
        <button
          onClick={async () => {
            await initializeMedia();
            setIsCallActive(true);
            await startCall();
          }}
        >
          <LucideVideo />
        </button>
      ) : (
        <button onClick={endCall}>End Call</button>
      )}
    </div>
  );
};

export default Video;
