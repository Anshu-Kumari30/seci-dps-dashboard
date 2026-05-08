module.exports = (sequelize, DataTypes) => {
  const PmcCeIssue = sequelize.define(
    "pmc_ce_issue",
    {
      pmc_ce_issue_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      dept_id: { type: DataTypes.UUID, allowNull: false },
      statistic_id: { type: DataTypes.UUID, allowNull: false },
      entity_id: { type: DataTypes.UUID, allowNull: false },
      issue_description: { type: DataTypes.TEXT, allowNull: true },
      issue_pertaining_to: { type: DataTypes.STRING, allowNull: true },
      issue_date: { type: DataTypes.DATE, allowNull: true },
      issue_doc_path: { type: DataTypes.STRING, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { timestamps: true, freezeTableName: true },
  );

  return PmcCeIssue;
};
