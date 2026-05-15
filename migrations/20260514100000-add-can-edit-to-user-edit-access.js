"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("user_edit_access");
    if (!table.can_edit) {
      await queryInterface.addColumn("user_edit_access", "can_edit", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable("user_edit_access");
    if (table.can_edit) {
      await queryInterface.removeColumn("user_edit_access", "can_edit");
    }
  },
};
