import { Router } from "express";
import { createRoom } from "../controllers/signaling.controller";

const signalRouter = Router();

signalRouter.post("/create-room", createRoom);

export default signalRouter;
