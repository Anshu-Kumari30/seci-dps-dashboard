'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('tender_registers');

    if (!table.rfs_date) {
      await queryInterface.addColumn('tender_registers', 'rfs_date', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.tariff) {
      await queryInterface.addColumn('tender_registers', 'tariff', {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('tender_registers');

    if (table.rfs_date) {
      await queryInterface.removeColumn('tender_registers', 'rfs_date');
    }

    if (table.tariff) {
      await queryInterface.removeColumn('tender_registers', 'tariff');
    }
  },
};
