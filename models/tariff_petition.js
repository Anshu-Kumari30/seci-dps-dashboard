module.exports = (sequelize, DataTypes) => {
  const TariffPetition = sequelize.define(
    'TariffPetition',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
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
      document_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      storage_path: {
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
      doc_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      uploaded_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'tariff_petitions',
      underscored: true,
      timestamps: true,
    }
  );

  return TariffPetition;
};
// NOTE: Duplicate/overriding export removed. The model above defines the full
// `TariffPetition` model and maps to the `tariff_petitions` table.
