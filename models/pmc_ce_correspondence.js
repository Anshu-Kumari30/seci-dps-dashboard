module.exports = (sequelize, DataTypes) => {
  const PmcCeCorrespondence = sequelize.define(
    "pmc_ce_correspondence",
    {
      dept_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      statistic_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      pmc_ce_corr_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correspondence_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      doc_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correspondence_type: {
        type: DataTypes.ENUM("contractor", "other"),
        allowNull: false,
        defaultValue: "contractor",
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
    },
  );

  return PmcCeCorrespondence;
};
