"use strict";

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('tariff_petitions', [
      {
        id: uuidv4(),
        dept_id: '00000000-0000-0000-0000-000000000001',
        statistic_id: '00000000-0000-0000-0000-000000000002',
        entity_id: '00000000-0000-0000-0000-000000000003',
        document_name: 'Sample Tariff Petition 1',
        storage_path: null,
        original_name: null,
        mime_type: null,
        size: null,
        doc_date: '2026-03-24',
        uploaded_by: 'seed-script',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        dept_id: '00000000-0000-0000-0000-000000000004',
        statistic_id: '00000000-0000-0000-0000-000000000005',
        entity_id: '00000000-0000-0000-0000-000000000006',
        document_name: 'Sample Tariff Petition 2',
        storage_path: null,
        original_name: null,
        mime_type: null,
        size: null,
        doc_date: '2026-02-15',
        uploaded_by: 'seed-script',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface /*, Sequelize */) {
    await queryInterface.bulkDelete('tariff_petitions', { uploaded_by: 'seed-script' });
  },
};
