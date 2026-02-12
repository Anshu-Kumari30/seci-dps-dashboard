module.exports = (sequelize, DataTypes) => {
  const om_project_type_Issues_actions = sequelize.define(
    "om_project_type_Issues_actions",
    {
      dept_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
      statistic_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },
      entity_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        primaryKey: true,
      },

      key_issues: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      action_plan: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "om_project_type_issues_actions",
      timestamps: true, // uses createdAt & updatedAt automatically
      underscored: false,
    }
  );

  return om_project_type_Issues_actions;
};
