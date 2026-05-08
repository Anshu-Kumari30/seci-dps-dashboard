require("dotenv").config();

const env = process.env;
const nodeEnv = String(env.NODE_ENV || "development").toLowerCase();

module.exports = {
  NODE_ENV: nodeEnv,

  SERVER_PORT: env.SERVER_PORT || 3000,

  DB_USER: env.DB_USER,
  DB_PASS: env.DB_PASS,
  DB_HOST: env.DB_HOST,
  DB_PORT: env.DB_PORT,

  DB_NAME: nodeEnv === "production" ? env.DB_NAME_PRODUCTION : env.DB_NAME_TESTING,
};
