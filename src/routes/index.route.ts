import { Router } from "express";
import signalRouter from "./signaling.route";

const routes = Router();

routes.use("/signaling", signalRouter);

export default routes;
