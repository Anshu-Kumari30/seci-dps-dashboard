"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const table = await queryInterface.describeTable("pmc_milestone");
      if (!table || !table.sr_no) {
        await queryInterface.addColumn("pmc_milestone", "sr_no", {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        });
      }
    } catch (e) {
      console.warn('Skipping add sr_no to pmc_milestone (may already exist):', e && e.message ? e.message : e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const table = await queryInterface.describeTable("pmc_milestone");
      if (table && table.sr_no) {
        await queryInterface.removeColumn("pmc_milestone", "sr_no");
      }
    } catch (e) {
      console.warn('Skipping remove sr_no from pmc_milestone:', e && e.message ? e.message : e);
    }
  },
};
