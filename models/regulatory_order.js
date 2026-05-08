const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RegulatoryOrder = sequelize.define(
    "RegulatoryOrder",
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
      tableName: "emd_regulatory_order",
      timestamps: true,
    }
  );

  return RegulatoryOrder;
};