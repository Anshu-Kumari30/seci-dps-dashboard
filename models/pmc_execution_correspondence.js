module.exports = (sequelize, DataTypes) => {
  const PmcExecutionCorrespondence = sequelize.define(
    'PmcExecutionCorrespondence',
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
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correspondence_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      correspondence_type: {
        type: DataTypes.ENUM('contractor', 'stakeholder'),
        allowNull: false,
        defaultValue: 'contractor',
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

  return PmcExecutionCorrespondence;
};
