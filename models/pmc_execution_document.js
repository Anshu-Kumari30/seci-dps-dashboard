module.exports = (sequelize, DataTypes) => {
  const PmcExecutionDocument = sequelize.define(
    'PmcExecutionDocument',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      pmc_entry_id: {
        type: DataTypes.STRING,
        allowNull: false,
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
      doc_type: {
        type: DataTypes.ENUM('contract', 'dpr', 'mpr'),
        allowNull: false,
        defaultValue: 'contract',
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

  return PmcExecutionDocument;
};
