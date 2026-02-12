module.exports = (sequelize, DataTypes) => {
  const BusinessDevelopmentTable = sequelize.define(
    "bd_table",
    {
      bd_entry_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      business_partner: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action_plan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action_pending_with: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      anticipated_capacity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      target: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  return BusinessDevelopmentTable;
};
