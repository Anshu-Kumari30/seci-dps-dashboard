const { sequelize } = require("../models");

(async () => {
  try {
    console.log("Syncing models to database (alter=true). This will create missing tables.");
    await sequelize.sync({ alter: true });
    console.log("Models synced successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing models:", err);
    process.exit(1);
  }
})();
