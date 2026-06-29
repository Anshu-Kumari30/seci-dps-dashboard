"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tender_registers", "storage_capacity_mw", {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tender_registers", "storage_capacity_mw");
  },
};
