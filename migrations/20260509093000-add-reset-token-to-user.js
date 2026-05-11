"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('user');
    if (!table.reset_token) {
      await queryInterface.addColumn('user', 'reset_token', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.reset_token_expires) {
      await queryInterface.addColumn('user', 'reset_token_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user', 'reset_token_expires');
    await queryInterface.removeColumn('user', 'reset_token');
  },
};
