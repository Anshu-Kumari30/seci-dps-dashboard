module.exports = (sequelize, DataTypes) => {
  const TariffContextValue = sequelize.define(
    'TariffContextValue',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      requested_tariff: {
        type: DataTypes.DECIMAL(12,6),
        allowNull: true,
      },
      approved_tariff: {
        type: DataTypes.DECIMAL(12,6),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'tariff_context_values',
      underscored: true,
      timestamps: true,
    },
  );

  return TariffContextValue;
};
