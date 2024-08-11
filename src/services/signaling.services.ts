import { getKurentoClient } from "../utils/kurento";
import kurento, { WebRtcEndpoint, RecorderEndpoint } from "kurento-client";
import { Server as SocketIOServer, Socket } from "socket.io";
import log from "../utils/logger";

export const createRoomService = async (
  sdpOffer: string,
  roomId: string,
  io: SocketIOServer,
  socket: Socket
) => {
  const client = await getKurentoClient();
  const pipeline = await client.create("MediaPipeline");

  const webRtcEndpoint1: WebRtcEndpoint = await pipeline.create(
    "WebRtcEndpoint"
  );
  const webRtcEndpoint2: WebRtcEndpoint = await pipeline.create(
    "WebRtcEndpoint"
  );

  const recorderEndpoint: RecorderEndpoint = await pipeline.create(
    "RecorderEndpoint",
    {
      uri: `file:///tmp/${roomId}.webm`,
    }
  );

  const sdpAnswer = await new Promise<string>((resolve, reject) => {
    webRtcEndpoint1.processOffer(
      sdpOffer,
      async (error: any, answer: string) => {
        if (error) {
          return reject("Error processing SDP offer: " + error);
        }
        resolve(answer);
      }
    );
  });

  await webRtcEndpoint1.connect(webRtcEndpoint2);
  await webRtcEndpoint1.connect(recorderEndpoint);

  recorderEndpoint.record();

  handleIceCandidates(webRtcEndpoint1, roomId, io, socket);
  handleIceCandidates(webRtcEndpoint2, roomId, io, socket);

  return {
    sdpAnswer,
    webRtcEndpoint1,
    webRtcEndpoint2,
    recorderEndpoint,
    pipeline,
  };
};

export const setupSignaling = (io: SocketIOServer, socket: Socket) => {
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    log.info(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("offer", async (roomId: string, sdpOffer: string) => {
    const { sdpAnswer } = await createRoomService(sdpOffer, roomId, io, socket);
    socket.emit("answer", roomId, sdpAnswer);
  });

  socket.on("disconnect", async () => {
    log.info("User disconnected:", socket.id);
  });
};

const handleIceCandidates = (
  endpoint: WebRtcEndpoint,
  roomId: string,
  io: SocketIOServer,
  socket: Socket
) => {
  endpoint.on("OnIceCandidate", (event: any) => {
    const candidate = kurento.getComplexType("IceCandidate")(event.candidate);
    io.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("ice-candidate", (candidate: any) => {
    endpoint.addIceCandidate(candidate);
  });

  endpoint.gatherCandidates((error: any) => {
    if (error) {
      log.error("Error gathering ICE candidates:", error);
      throw new Error("Error gathering ICE candidates: " + error);
    }
  });
};
