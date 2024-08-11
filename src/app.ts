import express, { NextFunction, Request, Response } from "express";
import config from "./config";
import morgan from "morgan";

import appErrorHandler from "./middlewares/errorHandler";
import router from "./routes/index.route";
import { NotFoundError } from "./exceptions/notFoundError";

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use("/", router);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(appErrorHandler);

export default app;
