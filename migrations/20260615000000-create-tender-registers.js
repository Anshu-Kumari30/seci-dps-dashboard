'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tender_registers', {
      tender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())'),
      },
      tender_title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tendering_agency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      technology_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      rfs_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tendered_capacity_mw: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true,
      },
      era_awarded_capacity_mw: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true,
      },
      loa_loi_capacity_mw: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true,
      },
      commissioned_capacity_mw: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true,
      },
      psa_ppa_capacity_mw: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: true,
      },
      stage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      excel_file_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      original_file_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded_at: {
        type: Sequelize.DATE,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('tender_registers', ['technology_type'], {
      name: 'idx_tender_registers_technology_type',
    });
    await queryInterface.addIndex('tender_registers', ['year'], {
      name: 'idx_tender_registers_year',
    });
    await queryInterface.addIndex('tender_registers', ['stage'], {
      name: 'idx_tender_registers_stage',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tender_registers');
  },
};
