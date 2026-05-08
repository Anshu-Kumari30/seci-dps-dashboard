"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // remove columns if they exist
    try {
      await queryInterface.removeColumn('tariff_petitions', 'request_tariff');
    } catch (e) { /* ignore if missing */ }
    try {
      await queryInterface.removeColumn('tariff_petitions', 'approved_tariff');
    } catch (e) { /* ignore if missing */ }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tariff_petitions', 'request_tariff', {
      type: Sequelize.DECIMAL(12,4),
      allowNull: true,
    });
    await queryInterface.addColumn('tariff_petitions', 'approved_tariff', {
      type: Sequelize.DECIMAL(12,4),
      allowNull: true,
    });
  },
};
