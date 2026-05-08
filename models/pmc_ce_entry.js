module.exports = (sequelize, DataTypes) => {
  const PmcCeEntry = sequelize.define(
    "pmc_ce_entry",
    {
      pmc_ce_entry_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      dept_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      statistic_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sno: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      milestone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stage_payment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      invoice_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      invoice_raised: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
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
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return PmcCeEntry;
};
