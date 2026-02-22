const { execSync } = require("child_process");
const express = require("express");
const path = require("path");
const { sequelize, models } = require("./models");
const { performance } = require("perf_hooks");
const { insertTestData } = require("./util");

require("dotenv").config(); // Load environment variables from .env

const MYSQL_CONTAINER = "seci-mysql";
const DB_PORT = 3306;
const SERVER_PORT = 3000;

function startTimer(label) {
  const start = performance.now();
  const interval = setInterval(() => {
    const elapsed = ((performance.now() - start) / 1000).toFixed(1);
    process.stdout.write(`⏱️  ${label}: ${elapsed}s\r`);
  }, 200);
  return () => {
    clearInterval(interval);
    const total = ((performance.now() - start) / 1000).toFixed(1);
    console.log(`✅ ${label} completed in ${total}s`);
  };
}

// Step 1: Start Docker MySQL container
function startDocker() {
  const end = startTimer("Starting Docker");
  try {
    console.log("🛠️  Starting Docker container...");
    execSync(
      `docker start ${MYSQL_CONTAINER} || docker run --name ${MYSQL_CONTAINER} ` +
        `-e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=seci_test_db -p ${DB_PORT}:3306 -d mysql:8`
    );
    console.log("✅ Docker container ready.");
  } catch (err) {
    console.error("❌ Docker error:", err.message);
    process.exit(1);
  }
  end();
}

// Step 2: Wait for MySQL to become available
async function waitForMysql(cb) {
  const end = startTimer("Waiting for MySQL");
  const { Sequelize } = require("sequelize");
  const sequelize = new Sequelize("seci_test_db", "root", "root", {
    host: "127.0.0.1",
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
  });

  const maxRetries = 10;
  let attempts = 0;

  const interval = setInterval(async () => {
    try {
      await sequelize.authenticate();
      clearInterval(interval);
      console.log("✅ MySQL is ready.");
      end();
      cb();
    } catch (e) {
      attempts++;
      if (attempts >= maxRetries) {
        console.error("❌ MySQL did not start in time.");
        clearInterval(interval);
        process.exit(1);
      }
      console.log("⏳ Waiting for MySQL...");
    }
  }, 3000);
}

// Step 3: Setup Sequelize and sync DB
async function setupDatabase() {
  const end = startTimer("Creating tables");
  await sequelize.sync({ force: true });
  end();
}

// Step 4: Setup Express app
function startExpressServer() {
  const end = startTimer("Starting Express");
  const app = express();
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });

  app.listen(SERVER_PORT, () => {
    console.log(`🚀 Express server running at http://localhost:${SERVER_PORT}`);
    end();
  });
}

// Step 5: Graceful shutdown — Drop tables + stop Docker
function handleShutdown() {
  process.on("SIGINT", async () => {
    console.log("\n🧹 Dropping all tables...");
    try {
      await sequelize.drop();
      console.log("✅ All tables dropped.");
    } catch (err) {
      console.error("❌ Failed to drop tables:", err.message);
    }

    console.log("🛑 Stopping Docker container...");
    try {
      execSync(`docker stop ${MYSQL_CONTAINER}`);
      console.log("✅ Docker container stopped.");
    } catch (err) {
      console.error("❌ Failed to stop container:", err.message);
    }

    process.exit();
  });
}

// Run everything
startDocker();
waitForMysql(async () => {
  await setupDatabase();
  if (process.env.NODE_ENV === "TESTING") {
    await insertTestData();
  }
  startExpressServer();
  handleShutdown();
});
