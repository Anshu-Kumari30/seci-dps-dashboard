"use strict";

module.exports = {
  up: async (queryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "postgres") {
      await queryInterface.sequelize.query(
        "DO $$ BEGIN " +
          "IF NOT EXISTS (" +
          "SELECT 1 FROM pg_type t " +
          "JOIN pg_enum e ON t.oid = e.enumtypid " +
          "WHERE t.typname = 'enum_user_role' " +
          "AND e.enumlabel = 'viewer'" +
          ") THEN " +
          "ALTER TYPE \"enum_user_role\" ADD VALUE 'viewer'; " +
          "END IF; " +
          "END $$;"
      );
      return;
    }

    if (dialect === "mysql" || dialect === "mariadb") {
      await queryInterface.sequelize.query(
        "ALTER TABLE `user` MODIFY COLUMN `role` " +
          "ENUM('admin','user','viewer') NOT NULL DEFAULT 'user'"
      );
    }
  },

  down: async (queryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "mysql" || dialect === "mariadb") {
      await queryInterface.sequelize.query(
        "ALTER TABLE `user` MODIFY COLUMN `role` " +
          "ENUM('admin','user') NOT NULL DEFAULT 'user'"
      );
    }
  },
};
