const express = require("express");
const path = require("path");
const { performance } = require("perf_hooks");
const {
  insertTestData,
  testAllApis,
  insertOMSolarBESSDummyData,
} = require("./util");
const config = require("./config");
const logger = require("./logger");

console.log("config.DB_USER", config.DB_USER);
console.log("config.DB_PASS", config.DB_PASS);
console.log("config.DB_HOST", config.DB_HOST);
console.log("config.DB_PORT", config.DB_PORT);

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION", err);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION", err);
});

// MySQL config
const DB_PORT = config.DB_PORT;
const SERVER_PORT = config.SERVER_PORT;
const DB_USER = config.DB_USER;
const DB_PASS = config.DB_PASS;
const DB_HOST = config.DB_HOST;

const { sequelize, models } = require("./models");

const mysql = require("mysql2/promise");
const { log } = require("console");

// Ensure database exists
async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: DB_PORT,
  });

  const DB_NAME = config.DB_NAME;

  logger.info(`Ensuring database: ${DB_NAME}`);

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
  await connection.end();
  logger.info(`✅ Database '${DB_NAME}' ensured.`);
}

// Utility: Timer
function startTimer(label) {
  const start = performance.now();
  const interval = setInterval(() => {
    const elapsed = ((performance.now() - start) / 1000).toFixed(1);
    process.stdout.write(`⏱️  ${label}: ${elapsed}s\r`);
  }, 200);
  return () => {
    clearInterval(interval);
    const total = ((performance.now() - start) / 1000).toFixed(1);
    logger.info(`✅ ${label} completed in ${total}s`);
  };
}

// Wait for MySQL to become available
async function waitForMysql() {
  const end = startTimer("Waiting for MySQL");
  const maxRetries = 100;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await sequelize.authenticate();
      logger.info("MySQL is ready");
      end();
      return;
    } catch (e) {
      attempts++;
      logger.info(
        `⏳ Attempt ${attempts}/${maxRetries} - Waiting for MySQL: ${e.message}`,
      );
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  console.error("❌ MySQL did not start in time.");
  process.exit(1);
}

// Setup DB schema
async function setupDatabase() {
  const end = startTimer("Creating tables");
  // await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  if (config.NODE_ENV === "PRODUCTION") {
    await sequelize.sync();
  } else {
    await sequelize.sync({ alter: true });
  }
  // await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  end();
}

// Start Express server
function startExpressServer() {
  const app = express();

  const morgan = require("morgan");

  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );

  handleShutdown();
  const end = startTimer("Starting Express");

  app.use("/api/data/audit", require("./routes/audit_routes"));
  app.use("/api/data/documents", require("./routes/document_upload"));
  app.use("/api/data/correspondences", require("./routes/document_upload"));
  app.use("/api/data/issues", require("./routes/document_upload"));
  app.use("/api/data/reia/documents", require("./routes/document_upload"));
  app.use("/api/data/om/excel/upload", require("./routes/document_upload"));
  app.use("/api/data/om/upload", require("./routes/document_upload"));

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });

  const api_routes = require("./routes");
  app.use("/api", api_routes);

  app.listen(SERVER_PORT, () => {
    logger.info(`🚀 Express server running at http://localhost:${SERVER_PORT}`);
    end();
  });
}


// 🟢 Main startup sequence
(async () => {
  await ensureDatabaseExists();
  await waitForMysql();
  await setupDatabase();

  if (config.NODE_ENV === "TESTING") {
    await insertTestData();
    // await insertOMSolarBESSDummyData();
  }

  startExpressServer();

  if (config.NODE_ENV === "TESTING") {
    await testAllApis();
  }
  logger.info(`ENVIRONMENT - ${config.NODE_ENV}`);
})();
