"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop old columns if they exist
    await queryInterface.removeColumn("om_dgr", "day");
    await queryInterface.removeColumn("om_dgr", "month");

    // Add new column
    await queryInterface.addColumn("om_dgr", "date", {
      type: Sequelize.DATE,
      allowNull: false,
    });
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
