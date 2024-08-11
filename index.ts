import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import config from "./src/config";
import app from "./src/app";
import log from "./src/utils/logger";
import { setupSignaling } from "./src/services/signaling.services";

dotenv.config();

const server = createServer(app);
const io = new SocketIOServer(server);

app.set("sessions", {});
app.set("io", io);

io.on("connection", (socket) => {
  log.info(`User connected: ${socket.id}`);

  app.set("socket", socket);
  setupSignaling(io, socket);

  socket.on("disconnect", async () => {
    log.info(`User disconnected: ${socket.id}`);

    const sessions = app.get("sessions");
    const session = sessions[socket.id];
    if (session) {
      log.info(`Cleaning up resources for socket: ${socket.id}`);

      try {
        if (session.webRtcEndpoint1) await session.webRtcEndpoint1.release();
        if (session.webRtcEndpoint2) await session.webRtcEndpoint2.release();
        if (session.recorderEndpoint) await session.recorderEndpoint.release();
        if (session.pipeline) await session.pipeline.release();
      } catch (error) {
        log.error("Error during cleanup:", error);
      }

      delete sessions[socket.id];
      app.set("sessions", sessions);
    }
  });
});

const port = config.PORT;

server.listen(port, () => {
  log.info(`App is listening at http://localhost:${port}`);
});
