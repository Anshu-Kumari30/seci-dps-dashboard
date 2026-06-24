module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("tender_registers");

    if (!table.psa_capacity_mw) {
      await queryInterface.addColumn("tender_registers", "psa_capacity_mw", {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      });
    }

    if (!table.ppa_capacity_mw) {
      await queryInterface.addColumn("tender_registers", "ppa_capacity_mw", {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("tender_registers");

    if (table.psa_capacity_mw) {
      await queryInterface.removeColumn("tender_registers", "psa_capacity_mw");
    }

    if (table.ppa_capacity_mw) {
      await queryInterface.removeColumn("tender_registers", "ppa_capacity_mw");
    }
  },
};
