const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeveloperPayment = sequelize.define(
    "DeveloperPayment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      document_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      document_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "emd_developer_payments",
      timestamps: true,
    }
  );

  return DeveloperPayment;
};