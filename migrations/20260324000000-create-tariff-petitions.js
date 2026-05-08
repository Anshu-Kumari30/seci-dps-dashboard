"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tariff_petitions", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      dept_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      statistic_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      document_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      storage_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      request_tariff: {
        type: Sequelize.DECIMAL(12,4),
        allowNull: true,
      },
      approved_tariff: {
        type: Sequelize.DECIMAL(12,4),
        allowNull: true,
      },
      doc_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface /*, Sequelize */) {
    await queryInterface.dropTable("tariff_petitions");
  },
};
