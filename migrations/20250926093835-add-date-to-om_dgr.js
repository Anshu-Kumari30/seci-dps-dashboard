"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop old columns if they exist
    try {
      const table = await queryInterface.describeTable("om_dgr");
      if (table && table.day) {
        await queryInterface.removeColumn("om_dgr", "day");
      }
      if (table && table.month) {
        await queryInterface.removeColumn("om_dgr", "month");
      }
    } catch (e) {
      // If table doesn't exist or describeTable fails, log and continue
      console.warn('Skipping removal of om_dgr.day/month:', e && e.message ? e.message : e);
    }

    // Add new column (if not present)
    try {
      const tableAfter = await queryInterface.describeTable("om_dgr");
      if (!tableAfter || !tableAfter.date) {
        await queryInterface.addColumn("om_dgr", "date", {
          type: Sequelize.DATE,
          allowNull: false,
        });
      }
    } catch (e) {
      console.warn('Failed to add om_dgr.date column:', e && e.message ? e.message : e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse changes (optional)
    await queryInterface.removeColumn("om_dgr", "date");

    await queryInterface.addColumn("om_dgr", "day", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("om_dgr", "month", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
