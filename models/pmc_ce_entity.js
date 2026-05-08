module.exports = (sequelize, DataTypes) => {
  const PmcConsultancyEntity = sequelize.define(
    "pmc_ce_entity",
    {
      pmc_ce_entity_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_capacity: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  PmcConsultancyEntity.associate = (models) => {
    PmcConsultancyEntity.hasMany(models.PmcConsultancyField, {
      foreignKey: "pmc_ce_entity_id",
      as: "fields",
      onDelete: "CASCADE",
    });
    PmcConsultancyEntity.hasMany(models.PmcCeMilestone, {
      foreignKey: "pmc_ce_entity_id",
      as: "milestones",
      onDelete: "CASCADE",
    });
  };

  return PmcConsultancyEntity;
};
