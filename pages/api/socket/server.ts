import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { socketHandlers } from "./socketHandler";

const ServerHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server || !res.socket.server.io) {
    console.log("Initializing Socket.io");
    const path = "/api/socket/server";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      cors: { origin: "*" }, // CORS 설정 추가
      maxHttpBufferSize: 1e7, // 적절한 버퍼 크기
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("[SERVER] connection");

      socketHandlers(socket, io);
      socket.on("disconnect", () => {
        console.log("[SERVER] disconnected");
      });
    });
  } else {
    console.log("Socket.io is already set up");
  }

  res.end();
};

export default ServerHandler;
