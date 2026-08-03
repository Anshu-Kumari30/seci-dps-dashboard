module.exports = (sequelize, DataTypes) => {
  const OwnProject = sequelize.define(
    "cp_own_project",
    {
      cp_entry_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      project_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      capacity_mw: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_cost: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      awarded_cost: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      agreement_no: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      agency: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      date_of_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      completion_time: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  return OwnProject;
};
