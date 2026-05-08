module.exports = (sequelize, DataTypes) => {
  const PmcCeMilestone = sequelize.define(
    "pmc_ce_milestone",
    {
      pmc_ce_milestone_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      pmc_ce_entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "pmc_ce_entity",
          key: "pmc_ce_entity_id",
        },
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
        allowNull: true,
        defaultValue: 0,
      },
      invoice_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      invoice_raised: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
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
        allowNull: true,
        defaultValue: "Pending",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PmcCeMilestone.associate = (models) => {
    PmcCeMilestone.belongsTo(models.PmcConsultancyEntity, {
      foreignKey: "pmc_ce_entity_id",
      as: "entity",
    });
  };

  return PmcCeMilestone;
};
