const fs = require("fs");
const winston = require("winston");

// ensure logs folder exists
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
