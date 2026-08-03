module.exports = (sequelize, DataTypes) => {
  const TenderRegister = sequelize.define(
    "TenderRegister",
    {
      tender_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      tender_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tendering_agency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      technology_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rfs_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rfs_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tariff: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },
      tendered_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      era_awarded_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      loa_loi_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      commissioned_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      psa_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      ppa_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      psa_ppa_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      stage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      storage_capacity_mw: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      excel_file_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      original_file_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "tender_registers",
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  );

  return TenderRegister;
};
