const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StateWiseDetail = sequelize.define(
    "StateWiseDetail",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      discom_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      psa_signed_mw: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      commissioned_mw: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      regulations_policy_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      report_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      project_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "emd_state_wise_details",
      timestamps: true,
    },
  );

  return StateWiseDetail;
};