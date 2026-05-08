module.exports = (sequelize, DataTypes) => {
  const PmcProject = sequelize.define(
    "pmc_project",
    {
      pmc_entry_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sno: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      service_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      client: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loa_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
        target_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      amount_received: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      amount_pending: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PmcProject.associate = (models) => {
    PmcProject.hasMany(models.PmcMilestone, {
      foreignKey: "pmc_entry_id",
      as: "milestones",
    });
  };

  return PmcProject;
};
