module.exports = (sequelize, DataTypes) => {
  const OMDGR = sequelize.define(
    "om_dgr",
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
      om_dgr_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      generation: { type: DataTypes.FLOAT, allowNull: false },
      radiation: { type: DataTypes.FLOAT, allowNull: false },
      machine_availability: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      grid_availability: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      cumulative_generation: { type: DataTypes.FLOAT, allowNull: false },
      cuf_till_date: {
        type: DataTypes.FLOAT,
        allowNull: false,
        default: 0.0,
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
  return OMDGR;
};
