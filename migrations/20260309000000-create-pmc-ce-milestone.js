'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pmc_ce_milestone', {
      pmc_ce_milestone_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      pmc_ce_entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pmc_ce_entity',
          key: 'pmc_ce_entity_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sr_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      milestone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stage_payment: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0,
      },
      invoice_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      invoice_raised: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
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
        defaultValue: 'Pending',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add index for faster lookups
    await queryInterface.addIndex('pmc_ce_milestone', ['pmc_ce_entity_id']);
    await queryInterface.addIndex('pmc_ce_milestone', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pmc_ce_milestone');
  },
};
