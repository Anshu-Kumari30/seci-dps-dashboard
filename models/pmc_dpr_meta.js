module.exports = (sequelize, DataTypes) => {
  const PmcDprMeta = sequelize.define(
    'pmc_dpr_meta',
    {
      pmc_dpr_meta_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pmc_dpr',
      },
      pmc_entry_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      number_of_projects: {
        type: DataTypes.INTEGER,
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

  PmcDprMeta.associate = (models) => {};

  return PmcDprMeta;
};
