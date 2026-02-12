module.exports = (sequelize, DataTypes) => {
  const OMDGRSolarBESS = sequelize.define(
    "om_dgr_solar_bess",
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
      om_dgr_solar_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      days: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      generation: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      radiation: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      bess_export: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      bess_import: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      plant_availability: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      bess_availability: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      grid_availability: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      peak_power: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      cumulative_generation: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      cumulative_bess_export: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      cumulative_bess_import: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      daily_cuf_worc: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      cuf_till_date: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0.0,
      },
      remarks: {
        type: DataTypes.STRING(500),
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
    }
  );
  return OMDGRSolarBESS;
};
