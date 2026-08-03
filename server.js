const express = require("express");
const path = require("path");
const fs = require("fs");
// Load .env from this src directory to avoid relying on process.cwd()
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { performance } = require("perf_hooks");
const {
  insertTestData,
  testAllApis,
  insertOMSolarBESSDummyData,
} = require("./util");
const config = require("./config");
const logger = require("./logger");

// Security: Never log credentials
logger.info(`Starting with DB_HOST=${config.DB_HOST} DB_PORT=${config.DB_PORT} DB_USER=${config.DB_USER}`);

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
const Sequelize = require("sequelize");

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
  try {
    if (config.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync({ alter: true });
    }
  } catch (err) {
    // If the database has reached MySQL's index limit, skip schema alteration
    // and continue startup. This avoids fatal startup errors in development
    // when many indexes already exist on large tables.
    const code = err && err.original && err.original.code;
    if (code === "ER_TOO_MANY_KEYS") {
      logger.warn(
        "Skipping schema alter due to ER_TOO_MANY_KEYS (too many indexes). Continuing startup.",
      );
    } else {
      throw err;
    }
  }
  await ensureEnergyManagementProjectColumns();
  // await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  end();
}

// Keep Energy Management schema compatible across environments.
async function ensureEnergyManagementProjectColumns() {
  const qi = sequelize.getQueryInterface();
  const tables = [
    "emd_developer_payments",
    "emd_power_sales",
    "emd_discom_payments",
    "emd_regulatory_order",
    "emd_state_wise_details",
  ];

  for (const tableName of tables) {
    try {
      const columns = await qi.describeTable(tableName);
      if (!columns.project_name) {
        await qi.addColumn(tableName, "project_name", {
          type: Sequelize.STRING,
          allowNull: true,
        });
        logger.info(`Added missing project_name column in ${tableName}`);
      }
    } catch (e) {
      logger.warn(
        `Skipping project_name ensure for ${tableName}: ${e.message}`,
      );
    }
  }
}

// Start Express server
function startExpressServer() {
  const app = express();

  const morgan = require("morgan");
  const helmet = require("helmet");
  const cors = require("cors");

  // ─── Security Headers ───
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: false, // Disabled for HTML pages that use inline scripts
  }));

  // ─── CORS - restrict to same origin ───
  app.use(cors({
    origin: false, // Only allow same-origin requests
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }));

  // ─── Rate Limiting ───
  // IP-based limiting removed: behind the IIS/ARR proxy every user shares one IP,
  // so it blocked innocent users. Login brute-force protection is now handled
  // per-account in auth_controller.js (failed-attempt lockout per email).
  // app.use("/api/", limiter);

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

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  const publicIconsDir = path.join(__dirname, "public", "icons");
  const rootIconsDir = path.join(__dirname, "icons");
  if (!fs.existsSync(publicIconsDir) && !fs.existsSync(rootIconsDir)) {
    logger.warn("Icons directory not found in public/icons or /icons.");
  }

  app.use(express.static(path.join(__dirname, "public")));
  app.use("/icons", express.static(publicIconsDir));
  app.use("/icons", express.static(rootIconsDir));
  // Serve uploaded files. File names are random timestamps so they are not
  // guessable. express.static only serves GET/HEAD (no writes, no listing).
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });

  const api_routes = require("./routes");
  app.use("/api", api_routes);

  // Serve a friendly route for the new PMC C&E projects page (alias)
  app.get("/pmc_ce_projects", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "pmc_ce_projects.html"));
  });

  // Serve a friendly route for the PMC projects page (DPR/PFR/BMS)
  app.get("/pmc_projects", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "pmc_projects.html"));
  });

  // ─── Global Error Handler (must be last) ───
  app.use((err, req, res, next) => {
    logger.error("Unhandled error:", { message: err.message, stack: err.stack });

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    }

    // Multer file type error
    if (err.message && err.message.includes("Invalid file type")) {
      return res.status(400).json({ error: err.message });
    }

    // Generic — don't leak error details in production
    res.status(err.status || 500).json({ error: "Internal server error" });
  });

  const port = process.env.PORT || SERVER_PORT;

  app.listen(port, () => {
    logger.info(`🚀 Express server running at port ${port}`);
    end();
  });

  // app.listen(SERVER_PORT, () => {
  //   logger.info(`🚀 Express server running at http://localhost:${SERVER_PORT}`);
  //   end();
  // });
}

// Graceful shutdown
function handleShutdown() {
  process.on("SIGINT", async () => {
    logger.info("Gracefully shutting down...");

    try {
      await sequelize.close();
      logger.info("DB connection closed.");
    } catch (err) {
      logger.error("Shutdown error", err);
    }

    process.exit(0);
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
