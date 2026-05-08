module.exports = (sequelize, DataTypes) => {
  const PmcExecutionMeta = sequelize.define(
    'pmc_execution_meta',
    {
      pmc_execution_meta_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pmc-execution',
      },
      pmc_entry_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      project_capacity: {
        type: DataTypes.DECIMAL(15,2),
        allowNull: true,
      },
      loa_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      scod: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      land: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fields: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PmcExecutionMeta.associate = (models) => {};

  return PmcExecutionMeta;
};
