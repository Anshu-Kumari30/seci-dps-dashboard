"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('user');
    if (!table.reset_mail_message_id) {
      await queryInterface.addColumn('user', 'reset_mail_message_id', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.reset_mail_response) {
      await queryInterface.addColumn('user', 'reset_mail_response', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('user', 'reset_mail_response');
    await queryInterface.removeColumn('user', 'reset_mail_message_id');
  },
};
