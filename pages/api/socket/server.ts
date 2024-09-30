import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { dateName } from "@/util/utils";
import { AWS_BUCKET, AWS_S3 } from "@/lib/aws-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  enteredDMList,
  sendMessageAndGetMessages,
} from "@/lib/service/service";
import { socketHandlers } from "./socketHandler";

const ServerHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io");
    const path = "/api/socket/server";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      maxHttpBufferSize: 1e8, // 10MB
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("서버 connection");

      socketHandlers(socket, io);
      socket.on("disconnect", () => {
        console.log("서버 disconnected");
      });
    });
  } else {
    console.log("Socketio is already set up");
  }

  res.end();
};

export default ServerHandler;
