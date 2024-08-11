import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT ?? 8000,
  NODE_ENV: process.env.NODE_ENV,
  API_PREFIX: process.env.API_PREFIX,
};

export default config;
