module.exports = (sequelize, DataTypes) => {
  const PmcBmsMeta = sequelize.define(
    'pmc_bms_meta',
    {
      pmc_bms_meta_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      segment: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pmc-bms',
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

  PmcBmsMeta.associate = (models) => {};

  return PmcBmsMeta;
};
