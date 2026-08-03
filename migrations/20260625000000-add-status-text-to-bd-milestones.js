"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("bd_milestones");

    // Change milestone_name from STRING to TEXT for larger word limit
    if (table.milestone_name && table.milestone_name.type !== "TEXT") {
      await queryInterface.changeColumn("bd_milestones", "milestone_name", {
        type: Sequelize.TEXT,
        allowNull: false,
      });
    }

    // Add milestone_status column
    if (!table.milestone_status) {
      await queryInterface.addColumn("bd_milestones", "milestone_status", {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "in-progress",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("bd_milestones");

    if (table.milestone_status) {
      await queryInterface.removeColumn("bd_milestones", "milestone_status");
    }

    // Revert milestone_name back to STRING
    if (table.milestone_name && table.milestone_name.type === "TEXT") {
      await queryInterface.changeColumn("bd_milestones", "milestone_name", {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
    }
  },
};
