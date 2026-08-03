"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("user_edit_access");
    if (!table.access_level) {
      await queryInterface.addColumn("user_edit_access", "access_level", {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: "edit",
      });

      // Backfill access_level based on existing can_edit values.
      await queryInterface.sequelize.query(
        "UPDATE user_edit_access SET access_level = 'view' WHERE can_edit = 0"
      );
      await queryInterface.sequelize.query(
        "UPDATE user_edit_access SET access_level = 'edit' WHERE access_level IS NULL OR access_level = ''"
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("user_edit_access");
    if (table.access_level) {
      await queryInterface.removeColumn("user_edit_access", "access_level");
    }
  },
};
