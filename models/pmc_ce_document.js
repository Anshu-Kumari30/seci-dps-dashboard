module.exports = (sequelize, DataTypes) => {
  const PmcCeDocument = sequelize.define(
    "pmc_ce_document",
    {
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
      pmc_ce_doc_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      doc_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      doc_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      doc_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      doc_type: {
        type: DataTypes.ENUM("cdoc", "dpr", "mpr", "tariff"),
        allowNull: false,
        defaultValue: "cdoc",
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
    },
  );

  return PmcCeDocument;
};
