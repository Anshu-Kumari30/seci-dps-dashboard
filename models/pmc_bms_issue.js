module.exports = (sequelize, DataTypes) => {
  const PmcBmsIssue = sequelize.define(
    'pmc_bms_issue',
    {
      issue_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      pmc_entry_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pmc_slice_context: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: true,
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
      issue_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      issue_pertaining_to: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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

  return PmcBmsIssue;
};
