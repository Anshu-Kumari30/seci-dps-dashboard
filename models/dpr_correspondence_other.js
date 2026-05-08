module.exports = (sequelize, DataTypes) => {
  const DprCorrespondenceOther = sequelize.define(
    'DprCorrespondenceOther',
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
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
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
      correspondent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correspondence_date: {
        type: DataTypes.DATEONLY,
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
      tableName: 'dpr_correspondences_other',
      underscored: true,
      timestamps: true,
    },
  );

  DprCorrespondenceOther.associate = (models) => {
    if (models.PmcProject) {
      DprCorrespondenceOther.belongsTo(models.PmcProject, {
        foreignKey: 'pmc_entry_id',
        targetKey: 'pmc_entry_id',
        constraints: false,
      });
    }
  };

  return DprCorrespondenceOther;
};
