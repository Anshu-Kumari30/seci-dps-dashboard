const { Sequelize } = require("sequelize");

const mysql = require("mysql2/promise");

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Seci@1234",
    port: 3309,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS seci_test_db`);
  await connection.end();
  console.log("✅ Database 'seci_test_db' ensured.");
}


const sequelize = new Sequelize("seci_test_db", "root", "Seci@1234", {
  host: "127.0.0.1",
  port: 3309,
  dialect: "mysql",
});

ensureDatabaseExists();
sequelize.authenticate()
  .then(() => console.log("✅ Connected!"))
  .catch(err => console.error("❌ Failed to connect:", err.message));
