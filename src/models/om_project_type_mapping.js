module.exports = (sequelize, DataTypes) => {
  const OMProjectTypeMapping = sequelize.define(
    "om_project_type_mapping",
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
      om_project_type: {
        type: DataTypes.ENUM("solar", "solar_bess", "solar_wind_bess"),
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  return OMProjectTypeMapping;
};
