module.exports = (sequelize, DataTypes) => {
  const TariffPetition = sequelize.define(
    "tariff_petition",
    {
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
  return TariffPetition;
};
