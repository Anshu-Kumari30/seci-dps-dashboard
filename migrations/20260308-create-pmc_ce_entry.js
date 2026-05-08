"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pmc_ce_entry", {
      pmc_ce_entry_id: {
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
      sno: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      milestone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stage_payment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      invoice_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      invoice_raised: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      invoice_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      invoice_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("pmc_ce_entry");
  },
};
