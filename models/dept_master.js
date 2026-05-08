module.exports = (sequelize, DataTypes) => {
  const DeptMaster = sequelize.define(
    "dept_master",
    {
      dept_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      dept_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      regular_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      yp_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      contractual_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
  return DeptMaster;
};
