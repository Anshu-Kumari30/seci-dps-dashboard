module.exports = (sequelize, DataTypes) => {
  const DprContractDocument = sequelize.define(
    'DprContractDocument',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      pmc_entry_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      storage_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      doc_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      dept_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      statistic_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      uploaded_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'dpr_contract_documents',
      underscored: true,
      timestamps: true,
    },
  );

  DprContractDocument.associate = (models) => {
    if (models.PmcProject) {
      DprContractDocument.belongsTo(models.PmcProject, {
        foreignKey: 'pmc_entry_id',
        targetKey: 'pmc_entry_id',
        constraints: false,
      });
    }
  };

  return DprContractDocument;
};
