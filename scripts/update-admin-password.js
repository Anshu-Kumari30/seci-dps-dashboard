/**
 * Run this script ONCE to update all existing admin users' password to Admin@123_
 * Usage: node scripts/update-admin-password.js
 *
 * After running, all admins can login with: Admin@123_
 * When they change their password via Forgot Password flow, only their new one will work.
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");

const config = require("../config/config");

const env = process.env.NODE_ENV?.toLowerCase() || "development";
const dbConfig = config[env] || config.development;

async function updateAdminPasswords() {
  const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
    }
  );

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database:", dbConfig.database);

    const newPassword = "Admin@123_";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result, meta] = await sequelize.query(
      `UPDATE user SET password = ? WHERE role = 'admin'`,
      { replacements: [hashedPassword] }
    );

    const count = meta?.affectedRows ?? (Array.isArray(result) ? result.length : '?');
    console.log(`✅ Updated ${count} admin user(s) to password: ${newPassword}`);
    console.log("   Each admin can now login with the new password.");
    console.log("   When they reset via Forgot Password, only their new password will work.");
  } catch (err) {
    console.error("❌ Error updating passwords:", err.message);
  } finally {
    await sequelize.close();
  }
}

updateAdminPasswords();
