"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("bd_table");

    // Add connectivity column
    if (!table.connectivity) {
      await queryInterface.addColumn("bd_table", "connectivity", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Add technology column
    if (!table.technology) {
      await queryInterface.addColumn("bd_table", "technology", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Add buyer column
    if (!table.buyer) {
      await queryInterface.addColumn("bd_table", "buyer", {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      });
    }

    // Change action_plan from STRING to TEXT for larger word limit
    if (table.action_plan && table.action_plan.type !== "TEXT") {
      await queryInterface.changeColumn("bd_table", "action_plan", {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("bd_table");

    if (table.connectivity) {
      await queryInterface.removeColumn("bd_table", "connectivity");
    }
    if (table.technology) {
      await queryInterface.removeColumn("bd_table", "technology");
    }
    if (table.buyer) {
      await queryInterface.removeColumn("bd_table", "buyer");
    }

    // Revert action_plan back to STRING
    if (table.action_plan && table.action_plan.type === "TEXT") {
      await queryInterface.changeColumn("bd_table", "action_plan", {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
  },
};
