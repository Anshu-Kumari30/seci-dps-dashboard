"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pmc_bms_issue", {
      issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      pmc_entry_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pmc_slice_context: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_name: { type: Sequelize.STRING, allowNull: true },
      original_name: { type: Sequelize.STRING, allowNull: true },
      mime_type: { type: Sequelize.STRING, allowNull: true },
      size: { type: Sequelize.INTEGER, allowNull: true },
      storage_path: { type: Sequelize.STRING, allowNull: true },
      issue_description: { type: Sequelize.TEXT, allowNull: true },
      issue_pertaining_to: { type: Sequelize.STRING, allowNull: true },
      issue_date: { type: Sequelize.DATEONLY, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pmc_bms_issue");
  },
};
