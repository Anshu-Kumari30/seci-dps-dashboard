require("dotenv").config();

const env = process.env;

module.exports = {
  NODE_ENV: env.NODE_ENV || "development",

  SERVER_PORT: env.SERVER_PORT || 3000,

  DB_USER: env.DB_USER,
  DB_PASS: env.DB_PASS,
  DB_HOST: env.DB_HOST,
  DB_PORT: env.DB_PORT,

  DB_NAME:
    env.NODE_ENV === "PRODUCTION"
      ? env.DB_NAME_PRODUCTION
      : env.DB_NAME_TESTING,
};
