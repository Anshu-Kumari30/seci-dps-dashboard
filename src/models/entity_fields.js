module.exports = (sequelize, DataTypes) => {
  const EntityFields = sequelize.define(
    "entity_fields",
    {
      dept_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "dept_master",
          key: "dept_id",
        },
      },
      statistic_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "dept_statistic",
          key: "statistic_id",
        },
      },
      entity_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "dept_entity",
          key: "entity_id",
        },
      },
      field_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      field_value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      field_unit: {
        type: DataTypes.STRING,
        allowNull: false,
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
  EntityFields.associate = (models) => {
    EntityFields.belongsTo(models.DeptEntity, {
      foreignKey: "entity_id",
      as: "entity",
    });
  };

  return EntityFields;
};
