// models/user_edit_access.js

module.exports = (sequelize, DataTypes) => {
  const UserEditAccess = sequelize.define(
    "user_edit_access",
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "user",
          key: "user_id",
        },
      },
      dept_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: "dept_master",
          key: "dept_id",
        },
      },
    },
    {
      tableName: "user_edit_access",
      timestamps: false,
    }
  );

  return UserEditAccess;
};
