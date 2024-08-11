import dotenv from "dotenv";
import config from "./src/config";
import app from "./src/app";
import log from "./src/utils/logger";

dotenv.config();

const port = config.PORT;

app.listen(port, () => {
  log.info(`App is listening at http://localhost:${port}`);
});
