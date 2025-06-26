import {
  deleteMessageAndGetMessages,
  enteredDMList,
  sendDMAndGetDM,
  directMessagesJoinRoom,
  isUserDMRoom,
} from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { createDMRoomId, dateName } from "@/util/utils";
import { NextApiRequest } from "next";
import { IncomingForm, Fields, Files } from "formidable";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseFormData = async (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> => {
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

const parseJsonData = async (req: NextApiRequest): Promise<any> => {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(JSON.parse(data));
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  // 메세지 전송, 이미지 업로드 처리
  if (req.method === "POST") {
    // 메세지 전송 처리
    let userId: string,
      roomId: string,
      message: string,
      type: string,
      startTime: string;
    try {
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("multipart/form-data")) {
        const { fields, files } = await parseFormData(req);

        // 필드 데이터 처리
        const [f_userId] = fields.userId as string[];
        const [f_roomId] = fields.roomId as string[];
        const [photoData] = fields.photo as string[];
        const [f_startTime] = fields.startTime as string[];
        const [photoDataName] = fields.photoName as string[];
        // base64 데이터에서 실제 이미지 데이터 추출
        const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 data");
        }
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const photoName = dateName({ name: photoDataName });

        await AWS_S3.send(
          new PutObjectCommand({
            Bucket: `${AWS_BUCKET}`,
            Key: `messages/${photoName}`, // 저장시 넣고 싶은 파일 이름
            Body: buffer,
            ContentType: contentType,
          }),
        );
        const photoUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/messages/${photoName}`;
        message = photoUrl;
        userId = f_userId;
        roomId = f_roomId;
        type = "image";
        startTime = f_startTime;
      } else {
        const body = await parseJsonData(req);
        userId = body.userId;
        roomId = body.roomId;
        message = body.message;
        startTime = body.startTime;
        type = "direct";
      }

      // roomId에서 다른 사용자 ID 추출하여 DM 방 생성 및 상대방 자동 참여 처리
      if (roomId && userId) {
        const roomIdParts = roomId.split("_");
        if (roomIdParts.length === 2) {
          const otherUserId = roomIdParts.find(
            (id: string) => parseInt(id) !== parseInt(userId),
          );
          if (otherUserId) {
            // 상대방이 DM 방에 참여했는지 확인
            const isOtherUserInRoom = await isUserDMRoom(
              parseInt(otherUserId),
              parseInt(userId),
            );

            // 메시지 보내는 사람 DM 방 생성/참여
            await directMessagesJoinRoom(
              parseInt(userId),
              parseInt(otherUserId),
            );

            // 상대방도 DM 방에 자동 참여 (첫 메시지 시점에)
            if (!isOtherUserInRoom) {
              console.log(`상대방 ${otherUserId}를 DM 방에 자동 참여시킴`);
              await directMessagesJoinRoom(
                parseInt(otherUserId),
                parseInt(userId),
              );

              // 상대방을 소켓 DM 방에도 join
              const io = res?.socket?.server?.io;
              if (io) {
                // 상대방의 소켓을 찾아서 DM 방에 직접 join
                const otherUserSockets = await io
                  .in(`userRoom:${otherUserId}`)
                  .fetchSockets();
                otherUserSockets.forEach((socket: any) => {
                  socket.join(`dm_${roomId}:${otherUserId}`);
                  socket.join(`dm_${roomId}`);
                  console.log(
                    `상대방 ${otherUserId} 소켓을 DM 방 ${roomId}에 join시킴`,
                  );
                });

                // 상대방에게 DM 방 join 알림도 보내기
                io.to(`userRoom:${otherUserId}`).emit("joinDmRoom", {
                  roomId: roomId,
                  chatId: parseInt(userId),
                  userId: parseInt(otherUserId),
                });
              }
            }

            // 양쪽 사용자에게 dmList 업데이트 알림 (상대방이 새로 참여한 경우)
            if (!isOtherUserInRoom) {
              console.log(`새로운 DM 방 생성: ${userId} <-> ${otherUserId}`);
              const senderDmList = await enteredDMList(parseInt(userId));
              const receiverDmList = await enteredDMList(parseInt(otherUserId));

              const io = res?.socket?.server?.io;
              if (io) {
                // userRoom에 접속한 소켓 수 확인
                const senderSockets = await io
                  .in(`userRoom:${userId}`)
                  .fetchSockets();
                const receiverSockets = await io
                  .in(`userRoom:${otherUserId}`)
                  .fetchSockets();

                console.log(
                  `🔍 발신자 ${userId} userRoom 소켓 수:`,
                  senderSockets.length,
                );
                console.log(
                  `🔍 수신자 ${otherUserId} userRoom 소켓 수:`,
                  receiverSockets.length,
                );

                // 발신자에게 dmList 업데이트
                console.log(
                  `📤 발신자 ${userId}에게 dmList 전송:`,
                  senderDmList.length,
                  "개",
                );
                io.to(`userRoom:${userId}`).emit("joinDmList", senderDmList);

                // 수신자에게 dmList 업데이트 (userRoom + 브로드캐스트)
                console.log(
                  `📤 수신자 ${otherUserId}에게 dmList 전송:`,
                  receiverDmList.length,
                  "개",
                );
                io.to(`userRoom:${otherUserId}`).emit(
                  "joinDmList",
                  receiverDmList,
                );

                // 추가: 더 확실한 전달을 위해 특정 사용자 ID로도 전송
                io.emit("dmListUpdate", {
                  targetUserId: parseInt(otherUserId),
                  dmList: receiverDmList,
                });

                io.emit("dmListUpdate", {
                  targetUserId: parseInt(userId),
                  dmList: senderDmList,
                });

                console.log(
                  `✅ DM 리스트 업데이트 알림 전송 완료: ${userId}, ${otherUserId}`,
                );
              }
            }
          }
        }
      }

      const result = await sendDMAndGetDM({
        userId: parseInt(userId),
        roomId,
        message,
        type,
      });

      res?.socket?.server?.io?.to(`dm_${roomId}`).emit("directMessages", {
        messages: result,
        messages_type: "direct",
        roomId,
        startTime,
      });

      // 모든 메시지 전송 후 양쪽 사용자의 dmList를 업데이트
      if (roomId && userId) {
        const roomIdParts = roomId.split("_");
        if (roomIdParts.length === 2) {
          const otherUserId = roomIdParts.find(
            (id: string) => parseInt(id) !== parseInt(userId),
          );
          if (otherUserId) {
            console.log(
              `📨 메시지 전송 완료 - dmList 업데이트: ${userId} <-> ${otherUserId}`,
            );

            const io = res?.socket?.server?.io;
            if (io) {
              // userRoom에 실제로 연결된 소켓 수 확인
              const senderSockets = await io
                .in(`userRoom:${userId}`)
                .fetchSockets();
              const receiverSockets = await io
                .in(`userRoom:${otherUserId}`)
                .fetchSockets();

              console.log(
                `🔍 DEBUG - 발신자 ${userId} userRoom 소켓 수:`,
                senderSockets.length,
              );
              console.log(
                `🔍 DEBUG - 수신자 ${otherUserId} userRoom 소켓 수:`,
                receiverSockets.length,
              );

              if (senderSockets.length === 0) {
                console.log(
                  `❌ 발신자 ${userId}가 userRoom에 연결되어 있지 않음`,
                );
              }
              if (receiverSockets.length === 0) {
                console.log(
                  `❌ 수신자 ${otherUserId}가 userRoom에 연결되어 있지 않음`,
                );
              }

              // 발신자와 수신자 모두에게 dmList 갱신 신호만 보내기
              console.log(
                `🔥🔥🔥 발신자 ${userId}에게 dmList 갱신 신호 전송!!! 🔥🔥🔥`,
              );
              io.to(`userRoom:${userId}`).emit("refreshDmList");

              console.log(
                `🔥🔥🔥 수신자 ${otherUserId}에게 dmList 갱신 신호 전송!!! 🔥🔥🔥`,
              );
              io.to(`userRoom:${otherUserId}`).emit("refreshDmList");

              console.log(
                `✅✅✅ 메시지 전송 후 dmList 갱신 신호 전송 완료!!! ✅✅✅`,
              );
            } else {
              console.log(`❌ io 객체가 없음 - socket 서버 초기화 문제`);
            }
          }
        }
      }

      res.status(200).json({ success: true, messages: result });
    } catch (error: any) {
      console.error("DM 메시지 전송 에러:", error);
      res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PATCH") {
    // 메세지 삭제 처리
    try {
      const body = await parseJsonData(req);
      const { userId, chatId, messageId, message_type, content } = body;
      const dmRoomId = createDMRoomId(chatId, userId);

      const result = await deleteMessageAndGetMessages(
        userId,
        dmRoomId,
        messageId,
        "direct",
      );

      if (message_type === "image") {
        const urlParts = content?.split("/");
        const fileName = urlParts?.[urlParts?.length - 1]; // 경로의 마지막 부분이 파일 이름
        AWS_S3.send(
          new DeleteObjectCommand({
            Bucket: `${AWS_BUCKET}`,
            Key: `messages/${fileName}`,
          }),
        );
      }

      res?.socket?.server?.io
        ?.to(`dm_${dmRoomId}:${userId}`)
        .emit("directMessages", {
          roomId: dmRoomId,
          messages: result,
          messages_type: "deleted",
          messageId,
        });

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
