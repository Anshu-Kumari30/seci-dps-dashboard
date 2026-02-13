module.exports = (sequelize, DataTypes) => {
  const DeptEntity = sequelize.define(
    "dept_entity",
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
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      entity_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity_value: {
        type: DataTypes.FLOAT,
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
    },
  );

  DeptEntity.associate = (models) => {
    DeptEntity.hasMany(models.EntityFields, {
      foreignKey: "entity_id",
      as: "fields", // alias for easier include
    });
  };

  return DeptEntity;
};
