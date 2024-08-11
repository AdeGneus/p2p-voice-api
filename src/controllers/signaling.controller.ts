import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createRoomService } from "../services/signaling.services";

export const createRoom = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const roomId = Math.random().toString(36).substring(2, 15);
    const { sdpOffer } = req.body;

    const io: SocketIOServer = req.app.get("io");
    const socket: Socket = req.app.get("socket");

    const { sdpAnswer } = await createRoomService(sdpOffer, roomId, io, socket);

    res.status(200).json({
      status: "success",
      message: "Room created successfully",
      data: {
        roomId,
        sdpAnswer,
      },
    });
  }
);
