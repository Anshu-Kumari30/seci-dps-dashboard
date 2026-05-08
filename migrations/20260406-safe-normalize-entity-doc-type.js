"use strict";

/**
 * Safe migration to normalize entity_docs.doc_type and recreate enum cleanly.
 * Strategy (up):
 * 1. Add temporary varchar column `doc_type_tmp`.
 * 2. Populate `doc_type_tmp` with normalized values (map unknowns to 'cdoc').
 * 3. Drop existing enum column `doc_type` and recreate it as ENUM('mpr','dpr','cdoc').
 * 4. Copy normalized values back and drop the temp column.
 *
 * Down attempts to restore a string fallback (non-enum) to avoid data loss.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add temporary column
    await queryInterface.addColumn("entity_docs", "doc_type_tmp", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "cdoc",
    });

    // 2. Normalize values into tmp: keep known values, fallback to 'cdoc'
    await queryInterface.sequelize.query(`
      UPDATE entity_docs
      SET doc_type_tmp = CASE
        WHEN doc_type IN ('mpr','dpr','cdoc','dp','ro') THEN doc_type
        WHEN doc_type IS NULL OR doc_type = '' THEN 'cdoc'
        ELSE 'cdoc'
      END
    `);

    // 3. Remove old column and recreate as clean ENUM
    // Some dialects require removing constraints first; removeColumn handles it.
    await queryInterface.removeColumn("entity_docs", "doc_type");

    await queryInterface.addColumn("entity_docs", "doc_type", {
      type: Sequelize.ENUM("mpr", "dpr", "cdoc", "dp", "ro"),
      allowNull: false,
      defaultValue: "cdoc",
    });

    // 4. Copy normalized values back and drop temp
    await queryInterface.sequelize.query(`
      UPDATE entity_docs SET doc_type = doc_type_tmp;
    `);

    await queryInterface.removeColumn("entity_docs", "doc_type_tmp");
  },

  down: async (queryInterface, Sequelize) => {
    // Down: keep a safe non-enum column to avoid failures.
    await queryInterface.addColumn("entity_docs", "doc_type_bak", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "cdoc",
    });

    await queryInterface.sequelize.query(`
      UPDATE entity_docs SET doc_type_bak = doc_type;
    `);

    // Remove enum column
    await queryInterface.removeColumn("entity_docs", "doc_type");

    // Re-create as plain string
    await queryInterface.addColumn("entity_docs", "doc_type", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "cdoc",
    });

    await queryInterface.sequelize.query(`
      UPDATE entity_docs SET doc_type = doc_type_bak;
    `);

    await queryInterface.removeColumn("entity_docs", "doc_type_bak");
  },
};
