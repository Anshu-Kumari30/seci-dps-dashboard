module.exports = (sequelize, DataTypes) => {
  const StateWiseRegulationFile = sequelize.define(
    "state_wise_regulation_file",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      swd_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "state_wise_data",
          key: "swd_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "state_wise_regulation_files",
      timestamps: false,
    }
  );

  StateWiseRegulationFile.associate = (models) => {
    StateWiseRegulationFile.belongsTo(models.StateWiseData, {
      foreignKey: "swd_id",
      targetKey: "swd_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return StateWiseRegulationFile;
};
