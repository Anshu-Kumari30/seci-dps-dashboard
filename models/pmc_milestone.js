module.exports = (sequelize, DataTypes) => {
  const PmcMilestone = sequelize.define(
    "pmc_milestone",
    {
      pmc_entry_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "pmc_project",
          key: "pmc_entry_id",
        },
      },
      milestone_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sr_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      milestone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stage_payment: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
      },
      invoice_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      invoice_raised: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      invoice_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invoice_number: {
        type: DataTypes.STRING,
        allowNull: true,
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

  PmcMilestone.associate = (models) => {
    PmcMilestone.belongsTo(models.PmcProject, {
      foreignKey: "pmc_entry_id",
      as: "project",
    });
  };

  return PmcMilestone;
};
