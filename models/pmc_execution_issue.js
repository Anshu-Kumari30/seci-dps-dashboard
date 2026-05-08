module.exports = (sequelize, DataTypes) => {
  const PmcExecutionIssue = sequelize.define(
    'PmcExecutionIssue',
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
    },
  );

  return PmcExecutionIssue;
};
