module.exports = (sequelize, DataTypes) => {
  const PmcConsultancyField = sequelize.define(
    "pmc_ce_field",
    {
      pmc_ce_field_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      pmc_ce_entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "pmc_ce_entity",
          key: "pmc_ce_entity_id",
        },
      },
      field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    

      field_value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PmcConsultancyField.associate = (models) => {
    PmcConsultancyField.belongsTo(models.PmcConsultancyEntity, {
      foreignKey: "pmc_ce_entity_id",
      as: "entity",
    });
  };

  return PmcConsultancyField;
};
